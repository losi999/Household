import { AdminGetUserResponse, AdminListGroupsForUserResponse } from '@aws-sdk/client-cognito-identity-provider';
import { headerSuppressEmail } from '@household/shared/constants';
import { UserType } from '@household/shared/enums';
import { Auth, User } from '@household/shared/types/types';
import { Comparer } from '@household/test/comparer';
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
  requestCreateUser: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateUser = async (user: User.Request) => {
      return loggedRequest.post(`${process.env.BASE_URL}/user/v1/users`, {
        headers: {
          Authorization: authToken,
          [headerSuppressEmail]: 'true',
        },
        data: user,
      });
    };

    await use(requestCreateUser);
  },
  requestConfirmUser: async ({ loggedRequest }, use) => {
    const requestConfirmUser = async (email: User.Email['email'], requestBody: Auth.ConfirmUser.Request) => {
      return loggedRequest.post(`${process.env.BASE_URL}/user/v1/users/${email}/confirm`, {
        data: requestBody,
      });
    };

    await use(requestConfirmUser);
  },
  requestDeleteUser: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteUser = async (email: User.Email['email']) => {
      return loggedRequest.delete(`${process.env.BASE_URL}/user/v1/users/${email}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteUser);
  },
  requestListUsers: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListUsers = async () => {
      return loggedRequest.get(`${process.env.BASE_URL}/user/v1/users`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListUsers);
  },
  requestAddUserToGroup: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestAddUserToGroup = async (email: string, group: UserType) => {
      return loggedRequest.post(`${process.env.BASE_URL}/user/v1/users/${email}/groups/${group}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestAddUserToGroup);
  },
  requestRemoveUserFromGroup: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestRemoveUserFromGroup = async (email: string, group: UserType) => {
      return loggedRequest.delete(`${process.env.BASE_URL}/user/v1/users/${email}/groups/${group}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestRemoveUserFromGroup);
  },
});

export const expect = baseExpect.extend({
  toHaveBeenAddedToGroup(groups: AdminListGroupsForUserResponse, expectedGroup: UserType) {
    const isInGroup = groups.Groups?.some(group => group.GroupName === expectedGroup);
    return {
      message: () => `Expected user to be in group '${expectedGroup}', but was not. Groups: ${JSON.stringify(groups.Groups)}`,
      pass: isInGroup,
    };
  },
  toHaveBeenRemovedFromGroup(groups: AdminListGroupsForUserResponse, expectedGroup: UserType) {
    const isInGroup = groups.Groups?.some(group => group.GroupName === expectedGroup);
    return {
      message: () => `Expected user to not be in group '${expectedGroup}', but was. Groups: ${JSON.stringify(groups.Groups)}`,
      pass: !isInGroup,
    };
  },
  toHaveBeenConfirmed(user: AdminGetUserResponse) {
    const isConfirmed = user.UserStatus === 'CONFIRMED';
    return {
      message: () => `Expected user to be confirmed, but status was '${user.UserStatus}'`,
      pass: isConfirmed,
    };
  },
  toHaveBeenCreated(user: AdminGetUserResponse) {
    const isCreated = user.UserStatus === 'FORCE_CHANGE_PASSWORD';
    return {
      message: () => `Expected user to be created, but status was '${user.UserStatus}'`,
      pass: isCreated,
    };
  },
  toHaveBeenDeleted(user: AdminGetUserResponse) {
    return {
      message: () => 'Expected user to be deleted, but it was not',
      pass: !user,
    };  
  },
  async toContainMatchingUser(received: APIResponse, user: User.Request & Partial<User.Group & Auth.Password>) {
    const response = await received.json() as User.Response[];

    const matchingResponse = response.find(u => u.email === user.email);

    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain a user with email ${user.email}, but it was not found`,
      };
    }

    const comparer = new Comparer(matchingResponse, {
      email: user.email,
      status: user.password ? 'CONFIRMED' : 'FORCE_CHANGE_PASSWORD',
      groups: [user.group],
    }); 

    const errors = comparer.validate();

    return {
      pass: errors.length === 0,
      message: () => `Expected response to contain a user with email ${user.email}, but found errors:\n${errors.join('\n')}`,
    };
  },
});
