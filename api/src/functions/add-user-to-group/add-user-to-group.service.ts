import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { User } from '@household/shared/types/types';

export interface IAddUserToGroup {
  (ctx: User.Group & User.Email): Promise<unknown>;
}

export const addUserToGroupServiceFactory = (identityService: IIdentityService): IAddUserToGroup => {
  return ({ group, email }) => {
    return identityService.addUserToGroup(email, group).catch(httpErrors.cognito.addUserToGroup());
  };
};
