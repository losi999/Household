import { Transaction } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const requestCreateTransferTransaction = (idToken: string, transaction: Transaction.TransferRequest) => {
  return cy.request({
    body: transaction,
    method: 'POST',
    url: '/transaction/v1/transactions/transfer',
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestUpdateToTransferTransaction = (idToken: string, transactionId: Transaction.Id, transaction: Transaction.TransferRequest) => {
  return cy.request({
    body: transaction,
    method: 'PUT',
    url: `/transaction/v1/transactions/${transactionId}/transfer`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

export const setTransferTransactionRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreateTransferTransaction,
    requestUpdateToTransferTransaction,
  });
};

declare global {
  namespace Cypress {

    interface ChainableRequest extends Chainable {
      requestCreateTransferTransaction: CommandFunctionWithPreviousSubject<typeof requestCreateTransferTransaction>;
      requestUpdateToTransferTransaction: CommandFunctionWithPreviousSubject<typeof requestUpdateToTransferTransaction>;
    }
  }
}
