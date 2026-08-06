import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { PaymentMethod } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsString()
  paymentMethod!: PaymentMethod;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ApprovePaymentDto {
  @IsString()
  status!: 'completed' | 'failed';

  @IsOptional()
  @IsString()
  planId?: string;
}
