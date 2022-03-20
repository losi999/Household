import { IIdentityService } from '@household/shared/services/identity-service';
import { httpError } from '@household/shared/common/utils';
import { Auth } from '@household/shared/types/types';

export interface ILoginService {
  (CTX: {
    body: Auth.Login.Request
  }): Promise<Auth.Login.Response>;
}

export const loginServiceFactory = (identityService: IIdentityService): ILoginService => {
  return async ({ body }) => {
    const loginResponse = await identityService.login(body).catch((error) => {
      console.error('Login', error);
      throw httpError(500, error.message);
    });

    return {
      idToken: loginResponse.AuthenticationResult.IdToken,
      refreshToken: loginResponse.AuthenticationResult.RefreshToken,
    };
  };
};
