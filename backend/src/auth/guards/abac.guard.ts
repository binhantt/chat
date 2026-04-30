import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CHECK_POLICIES_KEY } from '../decorators/check-policies.decorator';
import {
  AbacAction,
  AbacResource,
  PolicyHandler,
} from '../policies/abac.policy';
import { AuthenticatedRequest } from '../interfaces/authenticated-request.interface';

@Injectable()
export class AbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handlers =
      this.reflector.getAllAndOverride<PolicyHandler[]>(CHECK_POLICIES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (handlers.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new ForbiddenException('ABAC cần user đã đăng nhập');
    }

    const paramId = request.params.id;
    const resourceOwnerId = Array.isArray(paramId)
      ? paramId[0]
      : (paramId ?? request.user.id);

    const abacContext = {
      subject: request.user,
      action: this.getAction(request.method),
      resource: AbacResource.User,
      resourceOwnerId,
    };

    const allowed = handlers.every((handler) => handler(abacContext));

    if (!allowed) {
      throw new ForbiddenException(
        'Bạn không có quyền thực hiện hành động này',
      );
    }

    return true;
  }

  private getAction(method: string): AbacAction {
    if (method === 'POST') {
      return AbacAction.Create;
    }

    if (method === 'PATCH' || method === 'PUT') {
      return AbacAction.Update;
    }

    if (method === 'DELETE') {
      return AbacAction.Delete;
    }

    return AbacAction.Read;
  }
}
