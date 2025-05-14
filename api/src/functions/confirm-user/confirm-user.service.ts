import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Auth, User } from '@household/shared/types/types';

export interface IConfirmUserService {
  (ctx: {
    body: Auth.ConfirmUser.Request;
  } & User.Email): Promise<void>;
}

export const confirmUserServiceFactory = (identityService: IIdentityService): IConfirmUserService => {
  return async ({ body: { password, temporaryPassword }, email }) => {
    await identityService.confirmUser({
      password,
      temporaryPassword,
      email,
    }).catch(httpErrors.cognito.confirmUser({
      email,
    }));
  };
};
