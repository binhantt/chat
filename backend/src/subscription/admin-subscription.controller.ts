import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../users/entities/user.entity';
import { SubscriptionService } from './subscription.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Controller('v1/manager/subscription')
@UseGuards(DemoAuthGuard)
export class AdminSubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  private checkAdmin(request: AuthenticatedRequest) {
    if (request.user?.role !== UserRole.Admin) {
      throw new ForbiddenException('Chi admin moi co quyen');
    }
  }

  @Get('plans')
  getPlans(@Req() request: AuthenticatedRequest) {
    this.checkAdmin(request);
    return this.subscriptionService.findAllPlans();
  }

  @Post('plans')
  createPlan(
    @Body() dto: CreatePlanDto,
    @Req() request: AuthenticatedRequest,
  ) {
    this.checkAdmin(request);
    return this.subscriptionService.createPlan(dto);
  }

  @Patch('plans/:id')
  updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
    @Req() request: AuthenticatedRequest,
  ) {
    this.checkAdmin(request);
    return this.subscriptionService.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  deletePlan(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.checkAdmin(request);
    return this.subscriptionService.deletePlan(id);
  }

  @Get('users')
  getUserSubscriptions(@Req() request: AuthenticatedRequest) {
    this.checkAdmin(request);
    return this.subscriptionService.getAllUserSubscriptions();
  }
}
