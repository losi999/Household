import { Account } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { IAccountService } from '@household/shared/services/account-service';
import { getAccountId } from '@household/shared/common/utils';

const accountTask = <T extends keyof IAccountService>(name: T, params: Parameters<IAccountService[T]>) => {
  return cy.task(name, ...params);
};

const requestCreateAccount = (idToken: string, account: Account.Request) => {
  return cy.request({
    body: account,
    method: 'POST',
    url: '/account/v1/accounts',
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestUpdateAccount = (idToken: string, accountId: Account.IdType, account: Account.Request) => {
  return cy.request({
    body: account,
    method: 'PUT',
    url: `/account/v1/accounts/${accountId}`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestDeleteAccount = (idToken: string, accountId: Account.IdType) => {
  return cy.request({
    method: 'DELETE',
    url: `/account/v1/accounts/${accountId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetAccount = (idToken: string, accountId: Account.IdType) => {
  return cy.request({
    method: 'GET',
    url: `/account/v1/accounts/${accountId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetAccountList = (idToken: string) => {
  return cy.request({
    method: 'GET',
    url: '/account/v1/accounts',
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const validateAccountDocument = (response: Account.Id, request: Account.Request) => {
  const id = response?.accountId;

  cy.log('Get account document', id)
    .accountTask('getAccountById', [id])
    .should((document: Account.Document) => {
      expect(getAccountId(document), '_id').to.equal(id);
      expect(document.name, 'name').to.equal(request.name);
      expect(document.accountType, 'accountType').to.equal(request.accountType);
      expect(document.currency, 'currency').to.equal(request.currency);
      expect(document.balance, 'balance').to.equal(0);
      expect(document.isOpen, 'isOpen').to.equal(true);
    });
};

const validateAccountResponse = (response: Account.Response, document: Account.Document, balance: number) => {
  expect(response.accountId, 'accountId').to.equal(getAccountId(document));
  expect(response.name, 'name').to.equal(document.name);
  expect(response.accountType, 'accountType').to.equal(document.accountType);
  expect(response.currency, 'currency').to.equal(document.currency);
  expect(response.balance, 'balance').to.equal(balance);
  expect(response.isOpen, 'isOpen').to.equal(document.isOpen);
};

const validateAccountListResponse = (responses: Account.Response[], documents: Account.Document[], balances: number[]) => {
  documents.forEach((document, index) => {
    const response = responses.find(r => r.accountId === getAccountId(document));
    const balance = balances[index];
    validateAccountResponse(response, document, balance);
  });
};

const validateAccountDeleted = (accountId: Account.IdType) => {
  cy.log('Get account document', accountId)
    .accountTask('getAccountById', [accountId])
    .should((document) => {
      expect(document, 'document').to.be.null;
    });
};

const saveAccountDocument = (document: Account.Document) => {
  cy.accountTask('saveAccount', [document]);
};

export const setAccountCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateAccount,
    requestUpdateAccount,
    requestDeleteAccount,
    requestGetAccount,
    requestGetAccountList,
    validateAccountDocument,
    validateAccountResponse,
    validateAccountListResponse,
  });

  Cypress.Commands.addAll({
    accountTask,
    saveAccountDocument,
    validateAccountDeleted,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateAccountDeleted: CommandFunction<typeof validateAccountDeleted>;
      saveAccountDocument: CommandFunction<typeof saveAccountDocument>;
      accountTask: CommandFunction<typeof accountTask>;
    }

    interface ChainableRequest extends Chainable {
      requestCreateAccount: CommandFunctionWithPreviousSubject<typeof requestCreateAccount>;
      requestGetAccount: CommandFunctionWithPreviousSubject<typeof requestGetAccount>;
      requestUpdateAccount: CommandFunctionWithPreviousSubject<typeof requestUpdateAccount>;
      requestDeleteAccount: CommandFunctionWithPreviousSubject<typeof requestDeleteAccount>;
      requestGetAccountList: CommandFunctionWithPreviousSubject<typeof requestGetAccountList>;
    }

    interface ChainableResponseBody extends Chainable {
      validateAccountDocument: CommandFunctionWithPreviousSubject<typeof validateAccountDocument>;
      validateAccountResponse: CommandFunctionWithPreviousSubject<typeof validateAccountResponse>;
      validateAccountListResponse: CommandFunctionWithPreviousSubject<typeof validateAccountListResponse>;
    }
  }
}
