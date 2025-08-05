import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Auth, User } from '@household/shared/types/types';

export interface IConfirmForgotPasswordService {
  (ctx: {
    body: Auth.ConfirmForgotPassword.Request;
  } & User.Email): Promise<unknown>;
}

export const confirmForgotPasswordServiceFactory = (identityService: IIdentityService): IConfirmForgotPasswordService => {
  return ({ body: { confirmationCode, password }, email }) => {
    return identityService.confirmForgotPassword({
      confirmationCode,
      password,
      email,
    }).catch(httpErrors.cognito.confirmForgotPassword({
      email,
    }));
  };
};
