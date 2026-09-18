import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Requests } from '@household/shared/types/requests';

export interface IForgotPasswordService {
  (ctx: {
    body: Requests.ForgotPassword
  }): Promise<unknown>;
}

export const forgotPasswordServiceFactory = (identityService: IIdentityService): IForgotPasswordService => {
  return ({ body }) => {
    return identityService.forgotPassword(body).catch(httpErrors.cognito.forgotPassword({
      email: body.email,
    }));
  };
};
