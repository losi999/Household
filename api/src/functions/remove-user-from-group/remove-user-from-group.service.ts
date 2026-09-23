import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Api } from '@household/shared/types/api';

export interface IRemoveUserFromGroup {
  (ctx: Api.User.Group & Api.User.Email): Promise<unknown>;
}

export const removeUserFromGroupServiceFactory = (identityService: IIdentityService): IRemoveUserFromGroup => {
  return ({ group, email }) => {
    return identityService.removeUserFromGroup(email, group).catch(httpErrors.cognito.removeUserFromGroup());
  };
};
