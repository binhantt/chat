import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { AbacGuard } from '../auth/guards/abac.guard';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import {
  canCreateUser,
  canListUsers,
  canReadUser,
  canUpdateUser,
} from '../auth/policies/abac.policy';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserAccessDto } from './dto/update-user-access.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ProfileSetupDto } from './dto/profile-setup.dto';
import { UsersService } from './users.service';

@Controller('v1/users')
@UseGuards(DemoAuthGuard, AbacGuard)
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@Req() request: AuthenticatedRequest) {
    return request.user;
  }

  @Patch('me')
  updateCurrentUser(
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.usersService.update(request.user!.id, updateUserDto);
  }

  @Delete('me')
  async deleteCurrentUser(@Req() request: AuthenticatedRequest) {
    await this.usersService.deleteOwnAccount(request.user!.id);
    return { success: true };
  }

  @Get(':id')
  @CheckPolicies(canReadUser)
  findOne(@Param('id') id: string) {
    return this.usersService.findByIdOrFail(id);
  }

  @Patch(':id')
  @CheckPolicies(canUpdateUser)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post('setup-profile')
  setupProfile(
    @Body() profileSetupDto: ProfileSetupDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.usersService.setupProfile(request.user!.id, profileSetupDto);
  }

  @Post('unlink-google')
  unlinkGoogle(@Req() request: AuthenticatedRequest) {
    return this.usersService.unlinkGoogle(request.user!.id);
  }
}

@Controller('v1/manager/users')
@UseGuards(DemoAuthGuard, AbacGuard)
export class AdminUserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @CheckPolicies(canListUsers)
  findAll(
    @Query('limit') limit?: string,
    @Query('cursor') cursor?: string,
    @Query('status') status?: 'active' | 'banned',
  ) {
    return this.usersService.findAll({
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @Get(':id')
  @CheckPolicies(canReadUser)
  findAdminOne(@Param('id') id: string) {
    return this.usersService.findByIdOrFail(id);
  }

  @Post()
  @CheckPolicies(canCreateUser)
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createByAdmin(createUserDto);
  }

  @Patch(':id/access')
  @CheckPolicies(canUpdateUser)
  updateAccess(
    @Param('id') id: string,
    @Body() updateUserAccessDto: UpdateUserAccessDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.usersService.updateAccess(
      id,
      updateUserAccessDto,
      request.user!.id,
    );
  }

  @Patch(':id/badge')
  @CheckPolicies(canUpdateUser)
  updateBadge(
    @Param('id') id: string,
    @Body('badge') badge: string | null,
  ) {
    return this.usersService.update(id, { badge });
  }
}
