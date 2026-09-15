import { AdminGetUserResponse, AdminListGroupsForUserResponse, AuthFlowType, ListUsersInGroupResponse, MessageActionType, type AdminInitiateAuthResponse, type CognitoIdentityProvider, type ListUsersResponse } from '@aws-sdk/client-cognito-identity-provider';
import { UserType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';

export interface IIdentityService {
  login(body: Requests.Login): Promise<AdminInitiateAuthResponse>;
  createUser(body: Api.User.Email & Partial<Api.Auth.Password & Api.Auth.TemporaryPassword>, userType?: UserType, suppressEmail?: boolean): Promise<unknown>;
  deleteUser(ctx: Api.User.Email): Promise<unknown>;
  refreshToken(body: Requests.RefreshToken): Promise<AdminInitiateAuthResponse>;
  getUser(ctx: Api.User.Email): Promise<AdminGetUserResponse>;
  listUsers(): Promise<ListUsersResponse>;
  listUsersByGroupName(userType: UserType): Promise<ListUsersInGroupResponse>;
  listGroupsByUser(email: string): Promise<AdminListGroupsForUserResponse>;
  addUserToGroup(email: string, userType: UserType): Promise<unknown>;
  removeUserFromGroup(email: string, userType: UserType): Promise<unknown>;
  forgotPassword(body: Requests.ForgotPassword): Promise<unknown>;
  confirmUser(ctx: Api.User.Email & Requests.ConfirmUser): Promise<any>;
  confirmForgotPassword(ctx: Api.User.Email & Requests.ConfirmForgotPassword): Promise<unknown>;
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
      }).catch<AdminGetUserResponse>((error) => {
        if (error.name !== 'UserNotFoundException') {
          throw error;
        }
        return undefined;
      });
    },
    forgotPassword: (body) => {
      return cognito.forgotPassword({
        ClientId: clientId,
        Username: body.email,
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
    confirmForgotPassword: (body) => {
      return cognito.confirmForgotPassword({
        ClientId: clientId,
        Username: body.email,
        ConfirmationCode: body.confirmationCode,
        Password: body.password,
      });
    },
    listUsers: () => {
      return cognito.listUsers({
        UserPoolId: userPoolId,
      });
    },
    listUsersByGroupName: (userType) => {
      return cognito.listUsersInGroup({
        GroupName: userType,
        UserPoolId: userPoolId,
      });
    },
    listGroupsByUser: (email) => {
      return cognito.adminListGroupsForUser({
        UserPoolId: userPoolId,
        Username: email,
      });
    },
    addUserToGroup: (email, UserType) => {
      return cognito.adminAddUserToGroup({
        GroupName: UserType,
        Username: email,
        UserPoolId: userPoolId,
      });
    },
    removeUserFromGroup: (email, UserType) => {
      return cognito.adminRemoveUserFromGroup({
        GroupName: UserType,
        Username: email,
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
    createUser: async ({ email, password, temporaryPassword }, userType, suppressEmail) => {
      await cognito.adminCreateUser({
        UserPoolId: userPoolId,
        Username: email,
        TemporaryPassword: temporaryPassword,
        MessageAction: (password || suppressEmail) ? MessageActionType.SUPPRESS : undefined,
      });

      if (userType) {
        await cognito.adminAddUserToGroup({
          UserPoolId: userPoolId,
          Username: email,
          GroupName: userType,
        });
      }

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
