import { Auth } from '@household/shared/types/types';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

export interface IIdentityService {
  login(body: Auth.Login.Request): Promise<CognitoIdentityServiceProvider.AdminInitiateAuthResponse>;
  register(body: Auth.Registration.Request): Promise<any>;
  refreshToken(body: Auth.RefreshToken.Request): Promise<CognitoIdentityServiceProvider.AdminInitiateAuthResponse>;
}

export const identityServiceFactory = (
  userPoolId: string,
  clientId: string,
  cognito: CognitoIdentityServiceProvider): IIdentityService => {
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
      }).promise();
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
      }).promise();

      return cognito.adminSetUserPassword({
        UserPoolId: userPoolId,
        Password: body.password,
        Permanent: true,
        Username: body.email,
      }).promise();
    },
    refreshToken: (body) => {
      return cognito.adminInitiateAuth({
        UserPoolId: userPoolId,
        ClientId: clientId,
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        AuthParameters: {
          REFRESH_TOKEN: body.refreshToken,
        },
      }).promise();
    },
  };

  return instance;
};
