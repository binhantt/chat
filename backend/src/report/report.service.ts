import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../chat/entities/conversation.entity';
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
  recentPartners: ReportableUser[];
}

export interface UpdateReportStatusInput {
  status: ReportStatus;
  lockType?: UserLockType;
}

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
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
    const conversations = await this.conversationRepository.find({
      where: [{ user1Id: userId }, { user2Id: userId }],
      relations: ['user1', 'user2'],
      order: { updatedAt: 'DESC' },
      take: 10,
    });

    return this.toUniquePartners(userId, conversations, 10);
  }

  private toUniquePartners(
    userId: string,
    conversations: Conversation[],
    limit: number,
  ): ReportableUser[] {
    const users = new Map<string, ReportableUser>();

    for (const conv of conversations) {
      const partner = conv.user1Id === userId ? conv.user2 : conv.user1;

      if (users.has(partner.id)) {
        continue;
      }

      users.set(partner.id, {
        id: partner.id,
        fullName: partner.fullName,
        email: partner.email,
        avatarUrl: partner.avatarUrl,
        lastConversationAt: conv.updatedAt,
      });

      if (users.size >= limit) {
        break;
      }
    }

    return Array.from(users.values());
  }

  async findMyReports(reporterId: string): Promise<ReportWithContext[]> {
    const reports = await this.reportRepository.find({
      where: { reporterId },
      order: { createdAt: 'DESC' },
      relations: ['reporter', 'reportedUser'],
    });

    return Promise.all(
      reports.map((report) => this.toReportWithContext(report)),
    );
  }

  async findAllForAdmin(): Promise<ReportWithContext[]> {
    const reports = await this.reportRepository.find({
      where: {},
      order: { createdAt: 'DESC' },
      relations: ['reporter', 'reportedUser'],
    });

    return Promise.all(
      reports.map((report) => this.toReportWithContext(report)),
    );
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
      await this.usersService.lockFromReport(
        report.reportedUserId,
        input.lockType,
        report.id,
        `Vi pham theo bao cao ${report.id}`,
      );
      report.reportedUser = await this.usersService.findByIdOrFail(
        report.reportedUserId,
      );
    } else if (input.status === ReportStatus.Rejected) {
      report.lockType = UserLockType.None;
    }

    const savedReport = await this.reportRepository.save(report);
    savedReport.reporter = report.reporter;
    savedReport.reportedUser = report.reportedUser;
    return this.toReportWithContext(savedReport);
  }

  private async getRecentPartners(
    userId: string,
    limit = 10,
  ): Promise<ReportableUser[]> {
    const conversations = await this.conversationRepository.find({
      where: [{ user1Id: userId }, { user2Id: userId }],
      relations: ['user1', 'user2'],
      order: { updatedAt: 'DESC' },
      take: limit,
    });

    return this.toUniquePartners(userId, conversations, limit);
  }

  private async toReportWithContext(
    report: Report,
  ): Promise<ReportWithContext> {
    const recentPartners = await this.getRecentPartners(report.reportedUserId);
    return {
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
      recentPartners,
    };
  }
}
