import { Transaction } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const requestCreateSplitTransaction = (idToken: string, transaction: Transaction.SplitRequest) => {
  return cy.request({
    body: transaction,
    method: 'POST',
    url: '/transaction/v1/transactions/split',
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestUpdateToSplitTransaction = (idToken: string, transactionId: Transaction.Id, transaction: Transaction.SplitRequest) => {
  return cy.request({
    body: transaction,
    method: 'PUT',
    url: `/transaction/v1/transactions/${transactionId}/split`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

export const setSplitTransactionRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateSplitTransaction,
    requestUpdateToSplitTransaction,
  });
};

declare global {
  namespace Cypress {

    interface ChainableRequest extends Chainable {
      requestCreateSplitTransaction: CommandFunctionWithPreviousSubject<typeof requestCreateSplitTransaction>;
      requestUpdateToSplitTransaction: CommandFunctionWithPreviousSubject<typeof requestUpdateToSplitTransaction>;
    }
  }
}
