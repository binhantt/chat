import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { Conversation } from '../chat/entities/conversation.entity';
import { User, UserRole } from '../users/entities/user.entity';

export interface ReportWithContext {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: Date;
  reporter: { id: string; fullName: string | null; email: string };
  reportedUser: { id: string; fullName: string | null; email: string };
  recentPartners: { id: string; fullName: string | null; avatarUrl: string | null }[];
}

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(reporterId: string, dto: CreateReportDto): Promise<Report> {
    const report = this.reportRepository.create({
      reporterId,
      reportedUserId: dto.reportedUserId,
      reason: dto.reason,
      description: dto.description ?? null,
      status: ReportStatus.Pending,
    });

    return this.reportRepository.save(report);
  }

  async findAllForAdmin(): Promise<ReportWithContext[]> {
    const reports = await this.reportRepository.find({
      where: {},
      order: { createdAt: 'DESC' },
      relations: ['reporter', 'reportedUser'],
    });

    return Promise.all(
      reports.map(async (report) => {
        const recentPartners = await this.getRecentPartners(report.reportedUserId);
        return {
          id: report.id,
          reason: report.reason,
          description: report.description,
          status: report.status,
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
          },
          recentPartners,
        };
      }),
    );
  }

  async findOneForAdmin(id: string): Promise<ReportWithContext> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['reporter', 'reportedUser'],
    });

    if (!report) {
      throw new NotFoundException('Không tìm thấy báo cáo');
    }

    const recentPartners = await this.getRecentPartners(report.reportedUserId);

    return {
      id: report.id,
      reason: report.reason,
      description: report.description,
      status: report.status,
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
      },
      recentPartners,
    };
  }

  async updateStatus(id: string, status: ReportStatus, adminId: string): Promise<Report> {
    const report = await this.reportRepository.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException('Không tìm thấy báo cáo');
    }

    report.status = status;
    return this.reportRepository.save(report);
  }

  private async getRecentPartners(
    userId: string,
    limit = 4,
  ): Promise<{ id: string; fullName: string | null; avatarUrl: string | null }[]> {
    const conversations = await this.conversationRepository.find({
      where: [{ user1Id: userId }, { user2Id: userId }],
      relations: ['user1', 'user2'],
      order: { updatedAt: 'DESC' },
      take: limit,
    });

    return conversations.map((conv) => {
      const partner = conv.user1Id === userId ? conv.user2 : conv.user1;
      return {
        id: partner.id,
        fullName: partner.fullName,
        avatarUrl: partner.avatarUrl,
      };
    });
  }
}
