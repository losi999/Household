import { UserType } from '@household/shared/enums';

export type User = `${UserType}` | 'viewer';
export type UserPermissionMap = Record<User, boolean>;

export type Reassignment<T> = {
  from: T;
  to?: T;
};
