import { UserStatusType } from '@aws-sdk/client-cognito-identity-provider';
import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { User } from '@household/shared/types/types';

export interface IListUsersService {
  (): Promise<User.Response[]>;
}

export const listUsersServiceFactory = (identityService: IIdentityService): IListUsersService => {
  return async () => {
    const users = await identityService.listUsers().catch(httpErrors.cognito.listUsers());

    return users.Users.map(u => ({
      email: u.Attributes.find(a => a.Name === 'email').Value,
      status: u.UserStatus as UserStatusType,
    })).toSorted((a, b) => a.email.localeCompare(b.email, 'hu', {
      sensitivity: 'base',
    }));
  };
};
