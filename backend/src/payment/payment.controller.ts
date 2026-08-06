import {
  Body,
  Controller,
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
import { PaymentService } from './payment.service';
import { CreatePaymentDto, ApprovePaymentDto } from './dto/create-payment.dto';

@Controller('v1/payment')
@UseGuards(DemoAuthGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  createPayment(
    @Body() dto: CreatePaymentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.paymentService.createPayment(request.user!.id, dto);
  }

  @Get('history')
  getHistory(@Req() request: AuthenticatedRequest) {
    return this.paymentService.getUserPayments(request.user!.id);
  }
}

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
    return this.paymentService.getAllPayments();
  }

  @Get('stats')
  getStats(@Req() request: AuthenticatedRequest) {
    this.checkAdmin(request);
    return this.paymentService.getPaymentStats();
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
}
