import { getAccountId } from '@household/shared/common/utils';
import { headerExpiresIn } from '@household/shared/constants';
import { Account } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { createComparer } from '@household/test/utils';
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

const validateAccountResponse = (response: Account.Response, document: Account.Document, expectedBalance?: number): string => {
  const comparer = createComparer((compare) => {
    return {
      accountId: compare(response.accountId, getAccountId(document)),
      name: compare(response.name, document.name),
      accountType: compare(response.accountType, document.accountType),
      currency: compare(response.currency, document.currency),
      owner: compare(response.owner, document.owner),
      isOpen: compare(response.isOpen, document.isOpen),
      fullName: compare(response.fullName, `${document.name} (${document.owner})`),
      balance: compare(response.balance, expectedBalance),
    };
  });

  return comparer.validate(response);
};

export const expect = baseExpect.extend({
  async toBeStoredInDatabase(req: Account.Request, document: Account.Document) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected account to be stored in database, but it was not found',
      };
    }
  
    const comparer = createComparer((compare) => {
      return {
        name: compare(document.name, req.name),
        accountType: compare(document.accountType, req.accountType),
        currency: compare(document.currency, req.currency),
        owner: compare(document.owner, req.owner),
        isOpen: compare(document.isOpen, true),
      };  
    });
  
    const mossage = comparer.validate(document, '_id', 'createdAt', 'expiresAt', 'updatedAt');

    return {
      pass: !mossage,
      message: () => mossage,
    };
  },
  toHaveBeenDeletedFromDatabase(document: Account.Document) {
    return {
      pass: !document,
      message: () => `expected account to be deleted from database, but it was found with id ${getAccountId(document)}`,
    };
  },
  async toMatchAccountDocument(received: APIResponse, document: Account.Document, expectedBalance?: number) {
    const response = await received.json() as Account.Response;
  
    const message = validateAccountResponse(response, document, expectedBalance);
  
    return {
      pass: !message,
      message: () => message,
    };
  },
  async toMatchAccountDocumentInList(received: APIResponse, document: Account.Document, expectedBalance?: number) {
    const response = await received.json() as Account.Response[];
  
    const matchingResponse = response.find(r => r.accountId === getAccountId(document));
  
    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain an account with id ${getAccountId(document)}, but it was not found`,
      };
    }
  
    const message = validateAccountResponse(matchingResponse, document, expectedBalance);
  
    return {
      pass: !message,
      message: () => message,
    };
  }, 

});
