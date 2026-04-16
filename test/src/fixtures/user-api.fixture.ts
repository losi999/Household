import { headerSuppressEmail } from '@household/shared/constants';
import { UserType } from '@household/shared/enums';
import { Auth, User } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { APIResponse } from '@playwright/test';

type UserApiFixture = {
  requestCreateUser(user: User.Request): Promise<APIResponse>;
  requestConfirmUser(email: User.Email['email'], requestBody: Auth.ConfirmUser.Request): Promise<APIResponse>;
  requestDeleteUser(email: User.Email['email']): Promise<APIResponse>;
  requestListUsers(): Promise<APIResponse>;
  requestAddUserToGroup(email: string, group: UserType): Promise<APIResponse>;
  requestRemoveUserFromGroup(email: string, group: UserType): Promise<APIResponse>;
};

export const test = baseTest.extend<UserApiFixture>({
  requestCreateUser: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateUser = async (user: User.Request) => {
      return request.post(`${process.env.BASE_URL}/user/v1/users`, {
        headers: {
          Authorization: authToken,
          [headerSuppressEmail]: 'true',
        },
        data: user,
      });
    };

    await use(requestCreateUser);
  },
  requestConfirmUser: async ({ request }, use) => {
    const requestConfirmUser = async (email: User.Email['email'], requestBody: Auth.ConfirmUser.Request) => {
      return request.post(`${process.env.BASE_URL}/user/v1/users/${email}/confirm`, {
        data: requestBody,
      });
    };

    await use(requestConfirmUser);
  },
  requestDeleteUser: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteUser = async (email: User.Email['email']) => {
      return request.delete(`${process.env.BASE_URL}/user/v1/users/${email}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteUser);
  },
  requestListUsers: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListUsers = async () => {
      return request.get(`${process.env.BASE_URL}/user/v1/users`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListUsers);
  },
  requestAddUserToGroup: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestAddUserToGroup = async (email: string, group: UserType) => {
      return request.post(`${process.env.BASE_URL}/user/v1/users/${email}/groups/${group}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestAddUserToGroup);
  },
  requestRemoveUserFromGroup: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestRemoveUserFromGroup = async (email: string, group: UserType) => {
      return request.delete(`${process.env.BASE_URL}/user/v1/users/${email}/groups/${group}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestRemoveUserFromGroup);
  },
});

export const expect = baseExpect.extend({});
