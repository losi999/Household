import { Auth } from '@household/shared/types/types';
import type { AdminInitiateAuthResponse, CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';

export interface IIdentityService {
  login(body: Auth.Login.Request): Promise<AdminInitiateAuthResponse>;
  register(body: Auth.Registration.Request): Promise<any>;
  refreshToken(body: Auth.RefreshToken.Request): Promise<AdminInitiateAuthResponse>;
}

export const identityServiceFactory = (
  userPoolId: string,
  clientId: string,
  cognito: CognitoIdentityProvider): IIdentityService => {
  const instance: IIdentityService = {
    login: (body) => {
      return cognito.adminInitiateAuth({
        UserPoolId: userPoolId,
        ClientId: clientId,
        AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
        AuthParameters: {
          USERNAME: body.email,
          PASSWORD: body.password,
        },
      });
    },
    register: async (body) => {
      await cognito.adminCreateUser({
        UserPoolId: userPoolId,
        Username: body.email,
        MessageAction: 'SUPPRESS',
        UserAttributes: [
          {
            Name: 'email',
            Value: body.email,
          },
          {
            Name: 'nickname',
            Value: body.displayName,
          },
        ],
      });

      return cognito.adminSetUserPassword({
        UserPoolId: userPoolId,
        Password: body.password,
        Permanent: true,
        Username: body.email,
      });
    },
    refreshToken: (body) => {
      return cognito.adminInitiateAuth({
        UserPoolId: userPoolId,
        ClientId: clientId,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: body.refreshToken,
        },
      });
    },
  };

  return instance;
};
