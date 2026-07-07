import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DemoAuthGuard } from '../auth/guards/demo-auth.guard';
import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UserRole } from '../users/entities/user.entity';
import { CreateConductRuleHandler } from './commands/handlers/create-conduct-rule.handler';
import { DeleteConductRuleHandler } from './commands/handlers/delete-conduct-rule.handler';
import { UpdateConductRuleHandler } from './commands/handlers/update-conduct-rule.handler';
import type {
  ConductRuleCreateInput,
  ConductRuleQueryInput,
  ConductRuleUpdateInput,
} from './interfaces/conduct-rule-input.interface';
import { ConductRuleCreatePipe } from './pipes/conduct-rule-create.pipe';
import { ConductRuleIdPipe } from './pipes/conduct-rule-id.pipe';
import { ConductRuleQueryPipe } from './pipes/conduct-rule-query.pipe';
import { ConductRuleUpdatePipe } from './pipes/conduct-rule-update.pipe';
import { GetConductRulesHandler } from './queries/handlers/get-conduct-rules.handler';

@Controller('v1/manager/conduct-rules')
@UseGuards(DemoAuthGuard)
export class ConductController {
  constructor(
    private readonly getConductRulesHandler: GetConductRulesHandler,
    private readonly createConductRuleHandler: CreateConductRuleHandler,
    private readonly updateConductRuleHandler: UpdateConductRuleHandler,
    private readonly deleteConductRuleHandler: DeleteConductRuleHandler,
  ) {}

  @Get()
  findAll(
    @Req() request: AuthenticatedRequest,
    @Query(new ConductRuleQueryPipe()) query: ConductRuleQueryInput,
  ) {
    this.assertAdmin(request);
    return this.getConductRulesHandler.execute(query);
  }

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body(new ConductRuleCreatePipe()) body: ConductRuleCreateInput,
  ) {
    this.assertAdmin(request);
    return this.createConductRuleHandler.execute(body);
  }

  @Patch(':id')
  update(
    @Req() request: AuthenticatedRequest,
    @Param('id', ConductRuleIdPipe) id: string,
    @Body(new ConductRuleUpdatePipe()) body: ConductRuleUpdateInput,
  ) {
    this.assertAdmin(request);
    return this.updateConductRuleHandler.execute({ id, ...body });
  }

  @Delete(':id')
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', ConductRuleIdPipe) id: string,
  ) {
    this.assertAdmin(request);
    await this.deleteConductRuleHandler.execute({ id });
    return { ok: true };
  }

  private assertAdmin(request: AuthenticatedRequest) {
    if (request.user?.role !== UserRole.Admin) {
      throw new ForbiddenException('Chi admin moi co quyen quan ly ung xu');
    }
  }
}
