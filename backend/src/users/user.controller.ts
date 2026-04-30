import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(DemoAuthGuard, AbacGuard)
export class UserController {
  constructor(private readonly usersService: UsersService) {}

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
}

@Controller('admin/users')
@UseGuards(DemoAuthGuard, AbacGuard)
export class AdminUserController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @CheckPolicies(canListUsers)
  findAll() {
    return this.usersService.findAll();
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
}
