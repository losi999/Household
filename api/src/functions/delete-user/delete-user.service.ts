import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Api } from '@household/shared/types/api';

export interface IDeleteUserService {
  (ctx: Api.User.Email): Promise<unknown>;
}

export const deleteUserServiceFactory = (identityService: IIdentityService): IDeleteUserService => {
  return ({ email }) => {
    return identityService.deleteUser({
      email,
    }).catch(httpErrors.cognito.deleteUser({
      email,
    }));
  };
};
