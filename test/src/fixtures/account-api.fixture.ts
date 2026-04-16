import { headerExpiresIn } from '@household/shared/constants';
import { Account } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { APIResponse } from '@playwright/test';

type AccountApiFixture = {
  requestGetAccount(accountId: Account.Id): Promise<APIResponse>;
  requestListAccounts(): Promise<APIResponse>;
  requestCreateAccount(account: Account.Request): Promise<APIResponse>;
  requestUpdateAccount(accountId: Account.Id, account: Account.Request): Promise<APIResponse>;
  requestDeleteAccount(accountId: Account.Id): Promise<APIResponse>;
};

export const test = baseTest.extend<AccountApiFixture>({
  requestGetAccount: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestGetAccount = async (accountId: Account.Id) => {
      return request.get(`${process.env.BASE_URL}/account/v1/accounts/${accountId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestGetAccount);
  },
  requestListAccounts: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListAccounts = async () => {
      return request.get(`${process.env.BASE_URL}/account/v1/accounts`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListAccounts);
  },
  requestCreateAccount: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestCreateAccount = async (account: Account.Request) => {
      return request.post(`${process.env.BASE_URL}/account/v1/accounts`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: account,
      });
    };

    await use(requestCreateAccount);
  },
  requestUpdateAccount: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateAccount = async (accountId: Account.Id, account: Account.Request) => {
      return request.put(`${process.env.BASE_URL}/account/v1/accounts/${accountId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: account,
      });
    };

    await use(requestUpdateAccount);
  },
  requestDeleteAccount: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteAccount = async (accountId: Account.Id) => {
      return request.delete(`${process.env.BASE_URL}/account/v1/accounts/${accountId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteAccount);
  },
});

export const expect = baseExpect.extend({});
