import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Auth } from '@household/shared/types/types';

export interface IForgotPasswordService {
  (ctx: {
    body: Auth.ForgotPassword.Request
  }): Promise<unknown>;
}

export const forgotPasswordServiceFactory = (identityService: IIdentityService): IForgotPasswordService => {
  return ({ body }) => {
    return identityService.forgotPassword(body).catch(httpErrors.cognito.forgotPassword({
      email: body.email,
    }));
  };
};
