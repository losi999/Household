import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Api } from '@household/shared/types/api';

export interface IAddUserToGroup {
  (ctx: Api.User.Group & Api.User.Email): Promise<unknown>;
}

export const addUserToGroupServiceFactory = (identityService: IIdentityService): IAddUserToGroup => {
  return ({ group, email }) => {
    return identityService.addUserToGroup(email, group).catch(httpErrors.cognito.addUserToGroup());
  };
};
