import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../users/entities/user.entity';
import { SeppayService } from './seppay.service';

class CreateSeppayPaymentDto {
  @IsString()
  planId!: string;
}

class SeppayIpnDto {
  @IsOptional()
  @IsString()
  transactionCode?: string;

  @IsOptional()
  @IsString()
  order_code?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  transaction_status?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;
}

@Controller('v1/payment/seppay')
@UseGuards(DemoAuthGuard)
export class SeppayController {
  constructor(private readonly seppayService: SeppayService) {}

  @Post('create')
  async createPayment(
    @Body() dto: CreateSeppayPaymentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.seppayService.createPayment(request.user!.id, dto.planId);
  }

  @Get('status')
  async getStatus(@Req() request: AuthenticatedRequest) {
    if (!request.user?.id) {
      return { status: 'none' };
    }
    const payment = await this.seppayService.getPaymentStatus(request.user.id);
    if (!payment) {
      return { status: 'none' };
    }
    return payment;
  }

  @Post('sync')
  async syncTransactions() {
    const count = await this.seppayService.syncTransactions();
    return { success: true, synced: count };
  }
}

/**
 * Seppay IPN webhook — called by Seppay server when payment is received.
 * No auth guard because Seppay calls this externally with a secret key.
 */
@Controller('v1/payment/sepay')
export class SeppayIpnController {
  constructor(private readonly seppayService: SeppayService) {}

  @Post('ipn')
  async ipn(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ) {
    // SePay webhook format: gateway, transactionDate, accountNumber, subAccount,
    // content, transferType, transferAmount, referenceCode, id
    const txCode = body.referenceCode || body.reference_number || body.transactionCode || body.order_code || body.id?.toString() || '';
    const amount = Number(body.transferAmount || body.amount_in || body.amount || 0);
    const content = body.content || body.transaction_content || '';
    const subAccount = body.subAccount || body.sub_account || '';

    if (!txCode || amount <= 0) {
      return { success: false, message: 'Missing transaction data' };
    }

    // Try to confirm existing pending payment by matching content/subAccount
    const activated = await this.seppayService.confirmByTransactionCode(txCode, content || subAccount);

    // Even if no match, record the transaction
    if (!activated) {
      await this.seppayService.recordDeposit({
        transactionCode: txCode,
        amount,
        description: `SePay: ${content || txCode}`,
        userId: null,
      });
    }

    return { success: true };
  }
}

/**
 * Admin endpoints for Seppay payment management.
 */
@Controller('v1/manager/seppay')
@UseGuards(DemoAuthGuard)
export class AdminSeppayController {
  constructor(private readonly seppayService: SeppayService) {}

  private checkAdmin(request: AuthenticatedRequest) {
    if (request.user?.role !== UserRole.Admin) {
      throw new ForbiddenException('Chi admin moi co quyen');
    }
  }

  @Get('pending')
  async getPendingPayments(@Req() request: AuthenticatedRequest) {
    this.checkAdmin(request);
    return this.seppayService.getAllPendingPayments();
  }

  @Post('approve/:userId')
  async approvePayment(
    @Param('userId') userId: string,
    @Body() dto: CreateSeppayPaymentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    this.checkAdmin(request);
    return this.seppayService.confirmAndSubscribe(userId, dto.planId);
  }
}
