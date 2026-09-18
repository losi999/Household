import { getAccountId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Comparer } from '@household/test/comparer';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { APIResponse } from '@playwright/test';

type AccountApiFixture = {
  requestGetAccount(accountId: Api.Account.Id): Promise<APIResponse>;
  requestListAccounts(): Promise<APIResponse>;
  requestCreateAccount(account: Requests.Account): Promise<APIResponse>;
  requestUpdateAccount(accountId: Api.Account.Id, account: Requests.Account): Promise<APIResponse>;
  requestDeleteAccount(accountId: Api.Account.Id): Promise<APIResponse>;
};

export const test = baseTest.extend<AccountApiFixture>({
  requestGetAccount: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestGetAccount = async (accountId: Api.Account.Id) => {
      return loggedRequest.get(`${process.env.BASE_URL}/account/v1/accounts/${accountId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestGetAccount);
  },
  requestListAccounts: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListAccounts = async () => {
      return loggedRequest.get(`${process.env.BASE_URL}/account/v1/accounts`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListAccounts);
  },
  requestCreateAccount: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;
    
    const requestCreateAccount = async (account: Requests.Account) => {
      return loggedRequest.post(`${process.env.BASE_URL}/account/v1/accounts`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: account,
      });
    };

    await use(requestCreateAccount);
  },
  requestUpdateAccount: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateAccount = async (accountId: Api.Account.Id, account: Requests.Account) => {
      return loggedRequest.put(`${process.env.BASE_URL}/account/v1/accounts/${accountId}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: account,
      });
    };

    await use(requestUpdateAccount);
  },
  requestDeleteAccount: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestDeleteAccount = async (accountId: Api.Account.Id) => {
      return loggedRequest.delete(`${process.env.BASE_URL}/account/v1/accounts/${accountId}`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestDeleteAccount);
  },
});

export const validateAccountResponse = (response: Responses.Account, document: Documents.Account, expectedBalance?: number) => {
  return new Comparer(response, {
    accountId: getAccountId(document),
    name: document.name,
    accountType: document.accountType,
    currency: document.currency,
    owner: document.owner,
    isOpen: document.isOpen,
    fullName: `${document.name} (${document.owner})`,
    balance: expectedBalance,
  });
};

export const expect = baseExpect.extend({
  async toHaveBeenSavedAsAccountDocument(req: Requests.Account, document: Documents.Account) {
    if (!document) {
      return {
        pass: false,
        message: () => 'Expected account to be stored in database, but it was not found',
      };
    }
  
    const comparer = new Comparer(document, {
      name: req.name,
      accountType: req.accountType,
      currency: req.currency,
      owner: req.owner,
      isOpen: true,
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();

    return {
      pass: !errors.length,
      message: () => `Expected account to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  toHaveBeenDeletedFromDatabase(document: Documents.Account) {
    return {
      pass: !document,
      message: () => `Expected account to be deleted from database, but it was found with id ${getAccountId(document)}`,
    };
  },
  async toMatchAccountDocument(received: APIResponse, document: Documents.Account, expectedBalance?: number) {
    const response = await received.json() as Responses.Account;
  
    const errors = validateAccountResponse(response, document, expectedBalance).validate();
  
    return {
      pass: !errors.length,
      message: () => `Expected response to match account document, but it did not:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingAccountDocument(received: APIResponse, document: Documents.Account, expectedBalance?: number) {
    const response = await received.json() as Responses.Account[];
  
    const matchingResponse = response.find(r => r.accountId === getAccountId(document));
  
    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain an account with id ${getAccountId(document)}, but it was not found`,
      };
    }
  
    const errors = validateAccountResponse(matchingResponse, document, expectedBalance).validate();
  
    return {
      pass: !errors.length,
      message: () => `Expected response to match account document, but it did not:\n${errors.join('\n')}`,
    };
  }, 

});
