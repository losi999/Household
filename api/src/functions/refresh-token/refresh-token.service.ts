import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

export interface IRefreshTokenService {
  (CTX: {
    body: Requests.RefreshToken
  }): Promise<Responses.RefreshToken>;
}

export const refreshTokenServiceFactory = (identityService: IIdentityService): IRefreshTokenService => {
  return async ({ body }) => {
    const loginResponse = await identityService.refreshToken(body).catch(httpErrors.cognito.refreshToken());

    return {
      idToken: loginResponse.AuthenticationResult.IdToken,
    };
  };
};
