import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';

export interface IConfirmUserService {
  (ctx: {
    body: Requests.ConfirmUser;
  } & Api.User.Email): Promise<unknown>;
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
