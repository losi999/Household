import { Account, Common, Transaction, Report } from '@household/shared/types/types';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const requestDeleteTransaction = (idToken: string, transactionId: Transaction.Id) => {
  return cy.request({
    method: 'DELETE',
    url: `/transaction/v1/transactions/${transactionId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetTransaction = (idToken: string, accountId: Account.Id, transactionId: Transaction.Id) => {
  return cy.request({
    method: 'GET',
    url: `/transaction/v1/accounts/${accountId}/transactions/${transactionId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetTransactionListByAccount = (idToken: string, accountId: Account.Id, querystring?: Partial<Common.Pagination<number>>) => {
  return cy.request({
    method: 'GET',
    url: `/transaction/v1/accounts/${accountId}/transactions`,
    qs: querystring,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetTransactionReports = (idToken: string, report: Report.Request) => {
  return cy.request({
    method: 'POST',
    url: '/transaction/v1/transactionReports',
    body: report,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

export const setCommonTransactionRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestDeleteTransaction,
    requestGetTransaction,
    requestGetTransactionListByAccount,
    requestGetTransactionReports,
  });
};

declare global {
  namespace Cypress {

    interface ChainableRequest extends Chainable {
      requestGetTransaction: CommandFunctionWithPreviousSubject<typeof requestGetTransaction>;
      requestDeleteTransaction: CommandFunctionWithPreviousSubject<typeof requestDeleteTransaction>;
      requestGetTransactionListByAccount: CommandFunctionWithPreviousSubject<typeof requestGetTransactionListByAccount>;
      requestGetTransactionReports: CommandFunctionWithPreviousSubject<typeof requestGetTransactionReports>;
    }
  }
}
