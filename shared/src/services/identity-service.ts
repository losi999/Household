import { Auth, User } from '@household/shared/types/types';
import { AdminGetUserCommandOutput, AuthFlowType, MessageActionType, type AdminInitiateAuthResponse, type CognitoIdentityProvider, type ListUsersResponse } from '@aws-sdk/client-cognito-identity-provider';

export interface IIdentityService {
  login(body: Auth.Login.Request): Promise<AdminInitiateAuthResponse>;
  createUser(body: User.Email & Partial<Auth.Password & Auth.TemporaryPassword>, suppressEmail?: boolean): Promise<unknown>;
  deleteUser(ctx: User.Email): Promise<unknown>;
  refreshToken(body: Auth.RefreshToken.Request): Promise<AdminInitiateAuthResponse>;
  getUser(ctx: User.Email): Promise<AdminGetUserCommandOutput>;
  listUsers(): Promise<ListUsersResponse>;
  confirmUser(ctx: User.Email & Auth.ConfirmUser.Request): Promise<any>;
}

export const identityServiceFactory = (
  userPoolId: string,
  clientId: string,
  cognito: CognitoIdentityProvider): IIdentityService => {
  const instance: IIdentityService = {
    getUser: ({ email }) => {
      return cognito.adminGetUser({
        UserPoolId: userPoolId,
        Username: email,
      }).catch<AdminGetUserCommandOutput>((error) => {
        if (error.name !== 'UserNotFoundException') {
          throw error;
        }
        return undefined;
      });
    },
    confirmUser: async (body) => {
      const authResp = await cognito.adminInitiateAuth({
        ClientId: clientId,
        UserPoolId: userPoolId,
        AuthFlow: AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: body.email,
          PASSWORD: body.temporaryPassword,
        },
      });

      await cognito.adminRespondToAuthChallenge({
        ChallengeName: authResp.ChallengeName,
        UserPoolId: userPoolId,
        ClientId: clientId,
        Session: authResp.Session,
        ChallengeResponses: {
          USERNAME: body.email,
          NEW_PASSWORD: body.password,
        },
      });

      return cognito.adminUpdateUserAttributes({
        UserPoolId: userPoolId,
        Username: body.email,
        UserAttributes: [
          {
            Name: 'email_verified',
            Value: 'true',
          },
        ],
      });
    },
    listUsers: () => {
      return cognito.listUsers({
        UserPoolId: userPoolId,
      });
    },
    login: (body) => {
      return cognito.adminInitiateAuth({
        UserPoolId: userPoolId,
        ClientId: clientId,
        AuthFlow: AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: body.email,
          PASSWORD: body.password,
        },
      });
    },
    createUser: async ({ email, password, temporaryPassword }, suppressEmail) => {
      await cognito.adminCreateUser({
        UserPoolId: userPoolId,
        Username: email,
        TemporaryPassword: temporaryPassword,
        MessageAction: (password || suppressEmail) ? MessageActionType.SUPPRESS : undefined,
      });

      if (password) {
        return cognito.adminSetUserPassword({
          UserPoolId: userPoolId,
          Password: password,
          Permanent: true,
          Username: email,
        });
      }
    },
    deleteUser: ({ email }) => {
      return cognito.adminDeleteUser({
        Username: email,
        UserPoolId: userPoolId,
      }).catch((error) => {
        if (error.name !== 'UserNotFoundException') {
          throw error;
        }
      });
    },
    refreshToken: (body) => {
      return cognito.adminInitiateAuth({
        UserPoolId: userPoolId,
        ClientId: clientId,
        AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
        AuthParameters: {
          REFRESH_TOKEN: body.refreshToken,
        },
      });
    },
  };

  return instance;
};
