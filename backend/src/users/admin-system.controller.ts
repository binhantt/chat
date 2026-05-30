import {
  Controller,
  ForbiddenException,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import * as os from 'node:os';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from './entities/user.entity';

interface CpuSnapshot {
  idle: number;
  total: number;
}

@Controller('v1/manager/system')
@UseGuards(DemoAuthGuard)
export class AdminSystemController {
  @Get('metrics')
  async getMetrics(@Req() request: AuthenticatedRequest) {
    this.assertAdmin(request);

    const start = readCpuSnapshot();
    await wait(120);
    const end = readCpuSnapshot();
    const totalDelta = end.total - start.total;
    const idleDelta = end.idle - start.idle;
    const cpuUsagePercent =
      totalDelta > 0
        ? clampPercent(((totalDelta - idleDelta) / totalDelta) * 100)
        : 0;

    const totalMemoryBytes = os.totalmem();
    const freeMemoryBytes = os.freemem();
    const usedMemoryBytes = Math.max(totalMemoryBytes - freeMemoryBytes, 0);
    const processMemory = process.memoryUsage();

    return {
      cpu: {
        cores: os.cpus().length,
        usagePercent: Math.round(cpuUsagePercent),
      },
      memory: {
        freeBytes: freeMemoryBytes,
        totalBytes: totalMemoryBytes,
        usedBytes: usedMemoryBytes,
        usedPercent: Math.round(
          clampPercent((usedMemoryBytes / totalMemoryBytes) * 100),
        ),
      },
      process: {
        heapTotalBytes: processMemory.heapTotal,
        heapUsedBytes: processMemory.heapUsed,
        rssBytes: processMemory.rss,
        uptimeSeconds: Math.round(process.uptime()),
      },
      sampledAt: new Date().toISOString(),
      system: {
        hostname: os.hostname(),
        platform: os.platform(),
        uptimeSeconds: Math.round(os.uptime()),
      },
    };
  }

  private assertAdmin(request: AuthenticatedRequest) {
    if (request.user?.role !== UserRole.Admin) {
      throw new ForbiddenException('Chi admin moi duoc xem thong so server');
    }
  }
}

function readCpuSnapshot(): CpuSnapshot {
  return os.cpus().reduce(
    (snapshot, cpu) => {
      const total = Object.values(cpu.times).reduce(
        (sum, value) => sum + value,
        0,
      );

      return {
        idle: snapshot.idle + cpu.times.idle,
        total: snapshot.total + total,
      };
    },
    { idle: 0, total: 0 },
  );
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function clampPercent(value: number) {
  return Math.min(Math.max(value, 0), 100);
}
