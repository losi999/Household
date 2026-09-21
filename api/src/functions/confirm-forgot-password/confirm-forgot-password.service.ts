import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';

export interface IConfirmForgotPasswordService {
  (ctx: {
    body: Requests.ConfirmForgotPassword;
  } & Api.User.Email): Promise<unknown>;
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
