import { headerExpiresIn } from '@household/shared/constants';
import { Account } from '@household/shared/types/types';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

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

const requestUpdateAccount = (idToken: string, accountId: Account.Id, account: Account.Request) => {
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

const requestDeleteAccount = (idToken: string, accountId: Account.Id) => {
  return cy.request({
    method: 'DELETE',
    url: `/account/v1/accounts/${accountId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetAccount = (idToken: string, accountId: Account.Id) => {
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

export const setAccountRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateAccount,
    requestUpdateAccount,
    requestDeleteAccount,
    requestGetAccount,
    requestGetAccountList,
  });
};

declare global {
  namespace Cypress {
    interface ChainableRequest extends Chainable {
      requestCreateAccount: CommandFunctionWithPreviousSubject<typeof requestCreateAccount>;
      requestGetAccount: CommandFunctionWithPreviousSubject<typeof requestGetAccount>;
      requestUpdateAccount: CommandFunctionWithPreviousSubject<typeof requestUpdateAccount>;
      requestDeleteAccount: CommandFunctionWithPreviousSubject<typeof requestDeleteAccount>;
      requestGetAccountList: CommandFunctionWithPreviousSubject<typeof requestGetAccountList>;
    }
  }
}
