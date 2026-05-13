import { httpErrors } from '@household/api/common/error-handlers';
import { IIdentityService } from '@household/shared/services/identity-service';
import { Auth } from '@household/shared/types/types';

export interface ILoginService {
  (CTX: {
    body: Auth.Login.Request
  }): Promise<Auth.Login.Response>;
}

export const loginServiceFactory = (identityService: IIdentityService): ILoginService => {
  return async ({ body }) => {    
    const loginResponse = await identityService.login(body).catch(httpErrors.cognito.login({
      email: body.email,
    }));
    
    if (body.requiredUserType) {
      const userGroups = await identityService.listGroupsByUser(body.email).catch(httpErrors.cognito.listGroupsByUser());

      httpErrors.auth.notAllowedUserType({
        requiredUserType: body.requiredUserType,
        userGroups: userGroups.Groups,
      });
    }
    return {
      idToken: loginResponse.AuthenticationResult.IdToken,
      refreshToken: loginResponse.AuthenticationResult.RefreshToken,
    };
  };
};
