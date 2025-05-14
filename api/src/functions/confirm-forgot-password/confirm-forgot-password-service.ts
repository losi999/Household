import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Auth, User } from '@household/shared/types/types';

export interface IConfirmForgotPasswordService {
  (ctx: {
    body: Auth.ConfirmForgotPassword.Request;
  } & User.Email): Promise<void>;
}

export const confirmForgotPasswordServiceFactory = (identityService: IIdentityService): IConfirmForgotPasswordService => {
  return async ({ body: { confirmationCode, password }, email }) => {
    await identityService.confirmForgotPassword({
      confirmationCode,
      password,
      email,
    }).catch(httpErrors.cognito.confirmForgotPassword({
      email,
    }));
  };
};
