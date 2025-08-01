import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { User } from '@household/shared/types/types';

export interface IRemoveUserFromGroup {
  (ctx: User.Group & User.Email): Promise<void>;
}

export const removeUserFromGroupServiceFactory = (identityService: IIdentityService): IRemoveUserFromGroup => {
  return async ({ group, email }) => {
    await identityService.removeUserFromGroup(email, group).catch(httpErrors.cognito.removeUserFromGroup());
  };
};
