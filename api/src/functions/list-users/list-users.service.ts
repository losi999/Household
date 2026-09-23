import { UserStatusType } from '@aws-sdk/client-cognito-identity-provider';
import { httpErrors } from '@household/api/common/error-handlers';
import { UserType } from '@household/shared/enums';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Responses } from '@household/shared/types/responses';

export interface IListUsersService {
  (): Promise<Responses.User[]>;
}

export const listUsersServiceFactory = (identityService: IIdentityService): IListUsersService => {
  return async () => {

    const users = await identityService.listUsers().catch(httpErrors.cognito.listUsers());

    const userMap = users.Users.reduce<{
      [email: string]: Responses.User
    }>((accumulator, currentValue) => {
      const email = currentValue.Attributes.find(a => a.Name === 'email').Value ;
      return {
        ...accumulator,
        [email]: {
          email,
          status: currentValue.UserStatus as UserStatusType,
          groups: [],
        },
      };
    }, {});

    await Promise.all(Object.values(UserType).map(async (userType) => {
      const users = await identityService.listUsersByGroupName(userType).catch(httpErrors.cognito.listUsersByGroup());
      users.Users.forEach((user) => {
        const email = user.Attributes.find(a => a.Name === 'email').Value ;
        userMap[email].groups.push(userType);
      });
    
    }));

    return Object.values(userMap).toSorted((a, b) => a.email.localeCompare(b.email, 'hu', {
      sensitivity: 'base',
    }));

  };
};
