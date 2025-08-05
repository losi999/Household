import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Auth, User } from '@household/shared/types/types';

export interface IConfirmUserService {
  (ctx: {
    body: Auth.ConfirmUser.Request;
  } & User.Email): Promise<unknown>;
}

export const confirmUserServiceFactory = (identityService: IIdentityService): IConfirmUserService => {
  return ({ body: { password, temporaryPassword }, email }) => {
    return identityService.confirmUser({
      password,
      temporaryPassword,
      email,
    }).catch(httpErrors.cognito.confirmUser({
      email,
    }));
  };
};
