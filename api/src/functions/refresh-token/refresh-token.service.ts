import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Auth } from '@household/shared/types/types';

export interface IRefreshTokenService {
  (CTX: {
    body: Auth.RefreshToken.Request
  }): Promise<Auth.RefreshToken.Response>;
}

export const refreshTokenServiceFactory = (identityService: IIdentityService): IRefreshTokenService => {
  return async ({ body }) => {
    const loginResponse = await identityService.refreshToken(body).catch(httpErrors.common.genericError('Refresh token', body));

    return {
      idToken: loginResponse.AuthenticationResult.IdToken,
    };
  };
};
