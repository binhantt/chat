import { User, UserRole } from '../../users/entities/user.entity';

export enum AbacAction {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
}

export enum AbacResource {
  User = 'user',
}

export interface AbacContext {
  subject: User;
  action: AbacAction;
  resource: AbacResource;
  resourceOwnerId?: string;
}

export type PolicyHandler = (context: AbacContext) => boolean;

export const canCreateUser: PolicyHandler = (context) => {
  return (
    context.resource === AbacResource.User &&
    context.action === AbacAction.Create &&
    context.subject.role === UserRole.Admin
  );
};

export const canReadUser: PolicyHandler = (context) => {
  if (
    context.resource !== AbacResource.User ||
    context.action !== AbacAction.Read
  ) {
    return false;
  }

  return (
    context.subject.role === UserRole.Admin ||
    context.subject.id === context.resourceOwnerId
  );
};

export const canListUsers: PolicyHandler = (context) => {
  return (
    context.resource === AbacResource.User &&
    context.action === AbacAction.Read &&
    context.subject.role === UserRole.Admin
  );
};

export const canUpdateUser: PolicyHandler = (context) => {
  if (
    context.resource !== AbacResource.User ||
    context.action !== AbacAction.Update
  ) {
    return false;
  }

  return (
    context.subject.role === UserRole.Admin ||
    context.subject.id === context.resourceOwnerId
  );
};

export const canDeleteUser: PolicyHandler = (context) => {
  return (
    context.resource === AbacResource.User &&
    context.action === AbacAction.Delete &&
    context.subject.role === UserRole.Admin
  );
};
