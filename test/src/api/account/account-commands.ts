import { Account } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { IAccountService } from '@household/shared/services/account-service';

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
      expect(document._id.toString()).to.equal(id);
      expect(document.name).to.equal(request.name);
    });
};

const validateAccountResponse = (response: Account.Response, document: Account.Document) => {
  expect(response.accountId).to.equal(document._id.toString());
  expect(response.name).to.equal(document.name);
};

const validateAccountDeleted = (accountId: Account.IdType) => {
  cy.log('Get account document', accountId)
    .accountTask('getAccountById', [accountId])
    .should((document) => {
      expect(document).to.be.null;
    });
};

export const setAccountCommands = () => {
  Cypress.Commands.addAll<any, string>({
    prevSubject: true,
  }, {
    requestCreateAccount,
    requestUpdateAccount,
    requestDeleteAccount,
    requestGetAccount,
    requestGetAccountList,
  });

  Cypress.Commands.addAll({
    prevSubject: true,
  }, {
    validateAccountDocument,
    validateAccountResponse,
  });

  Cypress.Commands.addAll({
    accountTask,
    validateAccountDeleted,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateAccountDeleted: CommandFunction<typeof validateAccountDeleted>;
      accountTask: CommandFunction<typeof accountTask>
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
    }
  }
}
