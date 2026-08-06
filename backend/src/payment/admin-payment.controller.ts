import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../users/entities/user.entity';
import { PaymentService } from './payment.service';
import { ApprovePaymentDto } from './dto/create-payment.dto';

@Controller('v1/manager/payment')
@UseGuards(DemoAuthGuard)
export class AdminPaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  private checkAdmin(request: AuthenticatedRequest) {
    if (request.user?.role !== UserRole.Admin) {
      throw new ForbiddenException('Chi admin moi co quyen');
    }
  }

  @Get()
  getAll(@Req() request: AuthenticatedRequest) {
    this.checkAdmin(request);
    return this.paymentService.getAllPaymentsWithOrphans();
  }

  @Patch(':id')
  approve(
    @Param('id') id: string,
    @Body() dto: ApprovePaymentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    this.checkAdmin(request);
    return this.paymentService.approvePayment(id, dto);
  }

  @Get('stats')
  getStats(@Req() request: AuthenticatedRequest) {
    this.checkAdmin(request);
    return this.paymentService.getPaymentStats();
  }

  @Post('create')
  async create(
    @Body() body: { userId: string; amount: number; description?: string },
    @Req() request: AuthenticatedRequest,
  ) {
    this.checkAdmin(request);
    const payment = await this.paymentService.createPayment(body.userId, {
      amount: body.amount,
      paymentMethod: 'banking' as any,
      description: body.description || 'Admin deposit',
    });
    return payment;
  }
}
