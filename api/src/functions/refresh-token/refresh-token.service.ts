import { IIdentityService } from '@household/shared/services/identity-service';
import { httpError } from '@household/shared/common/utils';
import { Auth } from '@household/shared/types/types';

export interface IRefreshTokenService {
  (CTX: {
    body: Auth.RefreshToken.Request
  }): Promise<Auth.RefreshToken.Response>;
}

export const refreshTokenServiceFactory = (identityService: IIdentityService): IRefreshTokenService => {
  return async ({ body }) => {
    const loginResponse = await identityService.refreshToken(body).catch((error) => {
      console.error('Refresh token', error);
      throw httpError(500, error.message);
    });

    return {
      idToken: loginResponse.AuthenticationResult.IdToken,
    };
  };
};
