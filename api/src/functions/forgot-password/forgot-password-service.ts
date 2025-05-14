import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Auth } from '@household/shared/types/types';

export interface IForgotPasswordService {
  (ctx: {
    body: Auth.ForgotPassword.Request
  }): Promise<void>;
}

export const forgotPasswordServiceFactory = (identityService: IIdentityService): IForgotPasswordService => {
  return async ({ body }) => {
    await identityService.forgotPassword(body).catch(httpErrors.cognito.forgotPassword({
      email: body.email,
    }));
  };
};
