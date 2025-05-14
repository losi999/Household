import { Transaction } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunctionWithPreviousSubject } from '@household/test/api/types';

const requestCreatePaymentTransaction = (idToken: string, transaction: Transaction.PaymentRequest) => {
  return cy.request({
    body: transaction,
    method: 'POST',
    url: '/transaction/v1/transactions/payment',
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestUpdateToPaymentTransaction = (idToken: string, transactionId: Transaction.Id, transaction: Transaction.PaymentRequest) => {
  return cy.request({
    body: transaction,
    method: 'PUT',
    url: `/transaction/v1/transactions/${transactionId}/payment`,
    headers: {
      Authorization: idToken,
      [headerExpiresIn]: Cypress.env('EXPIRES_IN'),
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

export const setPaymentTransactionRequestCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    requestCreatePaymentTransaction,
    requestUpdateToPaymentTransaction,
  });
};

declare global {
  namespace Cypress {

    interface ChainableRequest extends Chainable {
      requestCreatePaymentTransaction: CommandFunctionWithPreviousSubject<typeof requestCreatePaymentTransaction>;
      requestUpdateToPaymentTransaction: CommandFunctionWithPreviousSubject<typeof requestUpdateToPaymentTransaction>;
    }
  }
}
