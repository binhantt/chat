import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../users/entities/user.entity';
import { ConductService } from './conduct.service';

@Controller('v1/admin/conduct-rules')
@UseGuards(DemoAuthGuard)
export class ConductController {
  constructor(private readonly conductService: ConductService) {}

  @Get()
  findAll(@Req() request: AuthenticatedRequest) {
    this.assertAdmin(request);
    return this.conductService.findAll();
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() body: { phrase?: string; note?: string },
  ) {
    this.assertAdmin(request);
    return this.conductService.create(body.phrase ?? '', body.note);
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
    @Body()
    body: {
      phrase?: string;
      note?: string | null;
      isActive?: boolean;
    },
  ) {
    this.assertAdmin(request);
    return this.conductService.update(id, body);
  }

  @Delete(':id')
  async remove(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    this.assertAdmin(request);
    await this.conductService.remove(id);
    return { ok: true };
  }

  private assertAdmin(request: AuthenticatedRequest) {
    if (request.user?.role !== UserRole.Admin) {
      throw new ForbiddenException('Chỉ admin mới có quyền quản lý ứng xử');
    }
  }
}
