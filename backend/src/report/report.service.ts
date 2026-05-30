import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Conversation } from '../chat/entities/conversation.entity';
import { Message } from '../chat/entities/message.entity';
import { ConductService } from '../conduct/conduct.service';
import { UserLockType } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateReportDto } from './dto/create-report.dto';
import { Report, ReportStatus } from './entities/report.entity';

export interface ReportableUser {
  id: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
  lastConversationAt: Date;
}

export interface ReportWithContext {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  lockType: UserLockType;
  createdAt: Date;
  reporter: { id: string; fullName: string | null; email: string };
  reportedUser: {
    id: string;
    fullName: string | null;
    email: string;
    lockType: UserLockType;
    lockedUntil: Date | null;
    isActive: boolean;
  };
  recentPartners?: ReportableUser[];
}

export interface UpdateReportStatusInput {
  status: ReportStatus;
  lockType?: UserLockType;
}

export interface AdminReportPage {
  items: ReportWithContext[];
  limit: number;
  nextCursor: string | null;
}

export interface ReportAiReview {
  evidenceMessages: Array<{
    content: string;
    conversationId: string;
    createdAt: Date;
    id: string;
    matchedRule: string;
  }>;
  matchedRules: string[];
  recommendation: 'block' | 'review' | 'none';
  reportId: string;
  riskLevel: 'high' | 'medium' | 'low';
  score: number;
  summary: string;
  suggestedLockType: UserLockType;
  suggestedStatus: ReportStatus;
}

interface AdminReportRow {
  report_createdAt: Date;
  report_description: string | null;
  report_id: string;
  report_lockType: UserLockType;
  report_reason: string;
  report_reportedUserId: string;
  report_reporterId: string;
  report_status: string;
  reportedUser_email: string;
  reportedUser_fullName: string | null;
  reportedUser_id: string;
  reportedUser_isActive: boolean;
  reportedUser_lockedUntil: Date | null;
  reportedUser_lockType: UserLockType;
  reporter_email: string;
  reporter_fullName: string | null;
  reporter_id: string;
}

interface RecentPartnerRow {
  avatarUrl: string | null;
  email: string;
  fullName: string | null;
  id: string;
  lastConversationAt: Date;
  targetUserId: string;
}

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly conductService: ConductService,
    private readonly usersService: UsersService,
  ) {}

  async create(reporterId: string, dto: CreateReportDto): Promise<Report> {
    const reportableUsers = await this.getReportableUsers(reporterId);
    const canReport = reportableUsers.some(
      (user) => user.id === dto.reportedUserId,
    );

    if (!canReport) {
      throw new BadRequestException(
        'Chi co the bao cao 1 trong 10 nguoi da noi chuyen gan nhat',
      );
    }

    const report = this.reportRepository.create({
      reporterId,
      reportedUserId: dto.reportedUserId,
      reason: dto.reason,
      description: dto.description ?? null,
      status: ReportStatus.Pending,
      lockType: UserLockType.None,
    });

    return this.reportRepository.save(report);
  }

  async getReportableUsers(userId: string): Promise<ReportableUser[]> {
    return (await this.getRecentPartnersMap([userId], 10)).get(userId) ?? [];
  }

  async findMyReports(reporterId: string): Promise<ReportWithContext[]> {
    const reports = await this.reportRepository.find({
      where: { reporterId },
      order: { createdAt: 'DESC' },
      relations: ['reporter', 'reportedUser'],
    });

    const recentPartnersByUserId = await this.getRecentPartnersMap(
      reports.map((report) => report.reportedUserId),
    );

    return reports.map((report) =>
      this.toReportContext(
        report,
        recentPartnersByUserId.get(report.reportedUserId) ?? [],
      ),
    );
  }

  async findAllForAdmin({
    cursor,
    limit = 20,
    status,
  }: {
    cursor?: string;
    limit?: number;
    status?: string;
  } = {}): Promise<AdminReportPage> {
    const safeLimit = Math.min(Math.max(limit || 20, 1), 100);
    const query = this.reportRepository
      .createQueryBuilder('report')
      .leftJoin('report.reporter', 'reporter')
      .leftJoin('report.reportedUser', 'reportedUser')
      .select([
        'report.id AS "report_id"',
        'report.reason AS "report_reason"',
        'report.description AS "report_description"',
        'report.status AS "report_status"',
        'report.lockType AS "report_lockType"',
        'report.createdAt AS "report_createdAt"',
        'report.reporterId AS "report_reporterId"',
        'report.reportedUserId AS "report_reportedUserId"',
        'reporter.id AS "reporter_id"',
        'reporter.fullName AS "reporter_fullName"',
        'reporter.email AS "reporter_email"',
        'reportedUser.id AS "reportedUser_id"',
        'reportedUser.fullName AS "reportedUser_fullName"',
        'reportedUser.email AS "reportedUser_email"',
        'reportedUser.lockType AS "reportedUser_lockType"',
        'reportedUser.lockedUntil AS "reportedUser_lockedUntil"',
        'reportedUser.isActive AS "reportedUser_isActive"',
      ])
      .orderBy('report.createdAt', 'DESC')
      .addOrderBy('report.id', 'DESC')
      .take(safeLimit + 1);

    if (this.isReportStatus(status)) {
      query.where('report.status = :status', { status });
    }

    const decodedCursor = this.decodeReportCursor(cursor);
    if (decodedCursor) {
      const condition =
        '(report.createdAt < :createdAt OR (report.createdAt = :createdAt AND report.id < :id))';
      if (this.isReportStatus(status)) {
        query.andWhere(condition, decodedCursor);
      } else {
        query.where(condition, decodedCursor);
      }
    }

    const rows = await query.getRawMany<AdminReportRow>();
    const items = rows
      .slice(0, safeLimit)
      .map((row) => this.toAdminReportListItem(row));
    const nextCursor =
      rows.length > safeLimit
        ? this.encodeReportCursor(items[items.length - 1])
        : null;

    return { items, limit: safeLimit, nextCursor };
  }

  async getAdminStats() {
    const [totalReports, statusRows, categoryRows] = await Promise.all([
      this.reportRepository.count(),
      this.reportRepository
        .createQueryBuilder('report')
        .select('report.status', 'status')
        .addSelect('COUNT(report.id)', 'count')
        .groupBy('report.status')
        .getRawMany<{ status: ReportStatus; count: string }>(),
      this.reportRepository
        .createQueryBuilder('report')
        .select('report.reason', 'reason')
        .addSelect('COUNT(report.id)', 'count')
        .groupBy('report.reason')
        .getRawMany<{ reason: string; count: string }>(),
    ]);

    const statusCounts = Object.fromEntries(
      statusRows.map((row) => [row.status, Number(row.count)]),
    ) as Partial<Record<ReportStatus, number>>;
    const reportsByCategory = Object.fromEntries(
      categoryRows.map((row) => [row.reason, Number(row.count)]),
    );

    return {
      totalReports,
      pendingReports: statusCounts[ReportStatus.Pending] ?? 0,
      reviewedReports: statusCounts[ReportStatus.Reviewed] ?? 0,
      resolvedReports: statusCounts[ReportStatus.Resolved] ?? 0,
      rejectedReports: statusCounts[ReportStatus.Rejected] ?? 0,
      reportsByCategory,
    };
  }

  async findOneForAdmin(id: string): Promise<ReportWithContext> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['reporter', 'reportedUser'],
    });

    if (!report) {
      throw new NotFoundException('Khong tim thay bao cao');
    }

    return this.toReportWithContext(report);
  }

  async updateStatus(
    id: string,
    input: UpdateReportStatusInput,
    adminId: string,
  ): Promise<ReportWithContext> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['reporter', 'reportedUser'],
    });

    if (!report) {
      throw new NotFoundException('Khong tim thay bao cao');
    }

    report.status = input.status;
    report.reviewedByAdminId = adminId;

    if (input.status === ReportStatus.Resolved) {
      if (!input.lockType || input.lockType === UserLockType.None) {
        throw new BadRequestException('Can chon muc khoa khi xac nhan vi pham');
      }

      report.lockType = input.lockType;
      report.reportedUser = await this.usersService.lockFromReport(
        report.reportedUserId,
        input.lockType,
        report.id,
        `Vi pham theo bao cao ${report.id}`,
      );
    } else {
      report.lockType = UserLockType.None;
      report.reportedUser = await this.usersService.unlockFromReport(
        report.reportedUserId,
        report.id,
      );
    }

    const savedReport = await this.reportRepository.save(report);
    savedReport.reporter = report.reporter;
    savedReport.reportedUser = report.reportedUser;
    return this.toReportWithContext(savedReport);
  }

  async reviewWithAi(id: string): Promise<ReportAiReview> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['reporter', 'reportedUser'],
    });

    if (!report) {
      throw new NotFoundException('Khong tim thay bao cao');
    }

    const [relatedMessages, reportCount] = await Promise.all([
      this.getReportedUserMessages(report),
      this.reportRepository.count({
        where: { reportedUserId: report.reportedUserId },
      }),
    ]);

    const evidenceMessages: ReportAiReview['evidenceMessages'] = [];
    const matchedRuleSet = new Set<string>();

    for (const message of relatedMessages) {
      const check = await this.conductService.checkMessage(message.content);
      if (!check.violated || !check.rule) {
        continue;
      }

      matchedRuleSet.add(check.rule.phrase);
      evidenceMessages.push({
        content: message.content,
        conversationId: message.conversationId,
        createdAt: message.createdAt,
        id: message.id,
        matchedRule: check.rule.phrase,
      });
    }

    const descriptionCheck = report.description
      ? await this.conductService.checkMessage(report.description)
      : { violated: false };
    if (descriptionCheck.violated && descriptionCheck.rule) {
      matchedRuleSet.add(descriptionCheck.rule.phrase);
    }

    let score = Math.min(evidenceMessages.length * 35, 70);
    if (descriptionCheck.violated) score += 15;
    if (
      report.reason === 'harassment' ||
      report.reason === 'inappropriate_content'
    ) {
      score += 15;
    }
    if (reportCount >= 3) score += 10;
    score = Math.min(score, 100);

    const riskLevel =
      score >= 70 ? 'high' : score >= 35 ? 'medium' : 'low';
    const recommendation =
      riskLevel === 'high' ? 'block' : riskLevel === 'medium' ? 'review' : 'none';
    const suggestedLockType =
      recommendation === 'block'
        ? UserLockType.ThirtyDays
        : UserLockType.None;
    const suggestedStatus =
      recommendation === 'block' ? ReportStatus.Resolved : ReportStatus.Reviewed;

    return {
      evidenceMessages: evidenceMessages.slice(0, 5),
      matchedRules: Array.from(matchedRuleSet),
      recommendation,
      reportId: report.id,
      riskLevel,
      score,
      summary: this.buildAiReviewSummary({
        evidenceCount: evidenceMessages.length,
        matchedRules: Array.from(matchedRuleSet),
        recommendation,
        reportCount,
        riskLevel,
      }),
      suggestedLockType,
      suggestedStatus,
    };
  }

  private async getRecentPartners(
    userId: string,
    limit = 10,
  ): Promise<ReportableUser[]> {
    return (await this.getRecentPartnersMap([userId], limit)).get(userId) ?? [];
  }

  private async getReportedUserMessages(report: Report): Promise<Message[]> {
    const conversations = await this.conversationRepository.find({
      order: { updatedAt: 'DESC' },
      select: { id: true },
      take: 5,
      where: [
        {
          user1Id: report.reporterId,
          user2Id: report.reportedUserId,
        },
        {
          user1Id: report.reportedUserId,
          user2Id: report.reporterId,
        },
      ],
    });

    const conversationIds = conversations.map((conversation) => conversation.id);
    if (conversationIds.length === 0) {
      return [];
    }

    return this.messageRepository.find({
      order: { createdAt: 'DESC' },
      select: {
        content: true,
        conversationId: true,
        createdAt: true,
        id: true,
        senderId: true,
      },
      take: 50,
      where: {
        conversationId: In(conversationIds),
        senderId: report.reportedUserId,
      },
    });
  }

  private buildAiReviewSummary({
    evidenceCount,
    matchedRules,
    recommendation,
    reportCount,
    riskLevel,
  }: {
    evidenceCount: number;
    matchedRules: string[];
    recommendation: ReportAiReview['recommendation'];
    reportCount: number;
    riskLevel: ReportAiReview['riskLevel'];
  }): string {
    if (recommendation === 'block') {
      return `Rui ro ${riskLevel}: phat hien ${evidenceCount} tin nhan trung luat ung xu (${matchedRules.join(', ') || 'khong ro'}). De xuat khoa tai khoan va xac nhan vi pham.`;
    }

    if (recommendation === 'review') {
      return `Rui ro ${riskLevel}: can admin doi chieu them. Tai khoan nay co ${reportCount} bao cao va ${evidenceCount} tin nhan nghi van.`;
    }

    return `Rui ro ${riskLevel}: chua thay tin nhan trung luat ung xu trong cac cuoc tro chuyen gan day.`;
  }

  private async getRecentPartnersMap(
    userIds: string[],
    limit = 10,
  ): Promise<Map<string, ReportableUser[]>> {
    const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
    const partnersByUserId = new Map<string, ReportableUser[]>();

    for (const userId of uniqueUserIds) {
      partnersByUserId.set(userId, []);
    }

    if (uniqueUserIds.length === 0) {
      return partnersByUserId;
    }

    const rows = await this.conversationRepository.query<RecentPartnerRow[]>(
      `
        WITH target_users AS (
          SELECT unnest($1::uuid[]) AS target_user_id
        ),
        distinct_partners AS (
          SELECT DISTINCT ON (target_users.target_user_id, partner.id)
            target_users.target_user_id AS "targetUserId",
            partner.id AS id,
            partner."fullName" AS "fullName",
            partner.email AS email,
            partner."avatarUrl" AS "avatarUrl",
            conversation."updatedAt" AS "lastConversationAt"
          FROM target_users
          JOIN conversations conversation
            ON conversation.user1_id = target_users.target_user_id
            OR conversation.user2_id = target_users.target_user_id
          JOIN users partner
            ON partner.id = CASE
              WHEN conversation.user1_id = target_users.target_user_id
                THEN conversation.user2_id
              ELSE conversation.user1_id
            END
          ORDER BY target_users.target_user_id, partner.id, conversation."updatedAt" DESC
        ),
        ranked_partners AS (
          SELECT
            *,
            ROW_NUMBER() OVER (
              PARTITION BY "targetUserId"
              ORDER BY "lastConversationAt" DESC
            ) AS partner_rank
          FROM distinct_partners
        )
        SELECT
          "targetUserId",
          id,
          "fullName",
          email,
          "avatarUrl",
          "lastConversationAt"
        FROM ranked_partners
        WHERE partner_rank <= $2
        ORDER BY "targetUserId", "lastConversationAt" DESC
      `,
      [uniqueUserIds, limit],
    );

    for (const row of rows) {
      const partners = partnersByUserId.get(row.targetUserId);
      if (!partners) {
        continue;
      }

      partners.push({
        id: row.id,
        fullName: row.fullName,
        email: row.email,
        avatarUrl: row.avatarUrl,
        lastConversationAt: new Date(row.lastConversationAt),
      });
    }

    return partnersByUserId;
  }

  private async toReportWithContext(
    report: Report,
    includeRecentPartners = true,
  ): Promise<ReportWithContext> {
    const recentPartners = includeRecentPartners
      ? await this.getRecentPartners(report.reportedUserId)
      : undefined;

    return this.toReportContext(report, recentPartners);
  }

  private toReportContext(
    report: Report,
    recentPartners?: ReportableUser[],
  ): ReportWithContext {
    const result: ReportWithContext = {
      id: report.id,
      reason: report.reason,
      description: report.description,
      status: report.status,
      lockType: report.lockType,
      createdAt: report.createdAt,
      reporter: {
        id: report.reporter.id,
        fullName: report.reporter.fullName,
        email: report.reporter.email,
      },
      reportedUser: {
        id: report.reportedUser.id,
        fullName: report.reportedUser.fullName,
        email: report.reportedUser.email,
        lockType: report.reportedUser.lockType,
        lockedUntil: report.reportedUser.lockedUntil,
        isActive: report.reportedUser.isActive,
      },
    };

    if (recentPartners) {
      result.recentPartners = recentPartners;
    }

    return result;
  }

  private toAdminReportListItem(row: AdminReportRow): ReportWithContext {
    return {
      id: row.report_id,
      reason: row.report_reason,
      description: row.report_description,
      status: row.report_status,
      lockType: row.report_lockType,
      createdAt: new Date(row.report_createdAt),
      reporter: {
        id: row.reporter_id,
        fullName: row.reporter_fullName,
        email: row.reporter_email,
      },
      reportedUser: {
        id: row.reportedUser_id,
        fullName: row.reportedUser_fullName,
        email: row.reportedUser_email,
        lockType: row.reportedUser_lockType,
        lockedUntil: row.reportedUser_lockedUntil
          ? new Date(row.reportedUser_lockedUntil)
          : null,
        isActive: row.reportedUser_isActive,
      },
    };
  }

  private isReportStatus(status?: string): status is ReportStatus {
    return Boolean(
      status && Object.values(ReportStatus).includes(status as ReportStatus),
    );
  }

  private encodeReportCursor(report: ReportWithContext): string {
    return Buffer.from(
      JSON.stringify({
        createdAt: new Date(report.createdAt).toISOString(),
        id: report.id,
      }),
    ).toString('base64url');
  }

  private decodeReportCursor(
    cursor?: string,
  ): { createdAt: Date; id: string } | null {
    if (!cursor) return null;

    try {
      const parsed = JSON.parse(
        Buffer.from(cursor, 'base64url').toString('utf8'),
      ) as { createdAt?: string; id?: string };
      if (!parsed.createdAt || !parsed.id) return null;

      const createdAt = new Date(parsed.createdAt);
      if (Number.isNaN(createdAt.getTime())) return null;

      return { createdAt, id: parsed.id };
    } catch {
      return null;
    }
  }
}
