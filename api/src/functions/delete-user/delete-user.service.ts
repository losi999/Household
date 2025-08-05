import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { User } from '@household/shared/types/types';

export interface IDeleteUserService {
  (ctx: User.Email): Promise<unknown>;
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
