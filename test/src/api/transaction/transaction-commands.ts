import { Account, Transaction } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { ITransactionService } from '@household/shared/services/transaction-service';

const transactionTask = <T extends keyof ITransactionService>(name: T, params: Parameters<ITransactionService[T]>) => {
  return cy.task(name, ...params);
};

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

const requestUpdateToPaymentTransaction = (idToken: string, transactionId: Transaction.IdType, transaction: Transaction.PaymentRequest) => {
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

const requestUpdateToTransferTransaction = (idToken: string, transactionId: Transaction.IdType, transaction: Transaction.TransferRequest) => {
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

const requestUpdateToSplitTransaction = (idToken: string, transactionId: Transaction.IdType, transaction: Transaction.SplitRequest) => {
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

const requestDeleteTransaction = (idToken: string, transactionId: Transaction.IdType) => {
  return cy.request({
    method: 'DELETE',
    url: `/transaction/v1/transactions/${transactionId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetTransaction = (idToken: string, accountId: Account.IdType, transactionId: Transaction.IdType) => {
  return cy.request({
    method: 'GET',
    url: `/transaction/v1/accounts/${accountId}/transactions/${transactionId}`,
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const requestGetTransactionList = (idToken: string) => {
  return cy.request({
    method: 'GET',
    url: '/transaction/v1/transactions',
    headers: {
      Authorization: idToken,
    },
    failOnStatusCode: false,
  }) as Cypress.ChainableResponse;
};

const validateTransactionPaymentDocument = (response: Transaction.Id) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .transactionTask('getTransactionById', [id])
    .should((document: Transaction.Document) => {
      expect(document._id.toString()).to.equal(id);
    });
};

const validateTransactionResponse = (response: Transaction.Response, document: Transaction.Document) => {
  expect(response.transactionId).to.equal(document._id.toString());
};

const validateTransactionDeleted = (transactionId: Transaction.IdType) => {
  cy.log('Get transaction document', transactionId)
    .transactionTask('getTransactionById', [transactionId])
    .should((document) => {
      expect(document).to.be.null;
    });
};

export const setTransactionCommands = () => {
  Cypress.Commands.addAll<any, string>({
    prevSubject: true,
  }, {
    requestCreatePaymentTransaction,
    requestCreateTransferTransaction,
    requestCreateSplitTransaction,
    requestUpdateToPaymentTransaction,
    requestUpdateToTransferTransaction,
    requestUpdateToSplitTransaction,
    requestDeleteTransaction,
    requestGetTransaction,
    requestGetTransactionList,
  });

  Cypress.Commands.addAll({
    prevSubject: true,
  }, {
    validateTransactionPaymentDocument,
    validateTransactionResponse,
  });

  Cypress.Commands.addAll({
    transactionTask,
    validateTransactionDeleted,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateTransactionDeleted: CommandFunction<typeof validateTransactionDeleted>;
      transactionTask: CommandFunction<typeof transactionTask>
    }

    interface ChainableRequest extends Chainable {
      requestCreatePaymentTransaction: CommandFunctionWithPreviousSubject<typeof requestCreatePaymentTransaction>;
      requestCreateTransferTransaction: CommandFunctionWithPreviousSubject<typeof requestCreateTransferTransaction>;
      requestCreateSplitTransaction: CommandFunctionWithPreviousSubject<typeof requestCreateSplitTransaction>;
      requestGetTransaction: CommandFunctionWithPreviousSubject<typeof requestGetTransaction>;
      requestUpdateToPaymentTransaction: CommandFunctionWithPreviousSubject<typeof requestUpdateToPaymentTransaction>;
      requestUpdateToTransferTransaction: CommandFunctionWithPreviousSubject<typeof requestUpdateToTransferTransaction>;
      requestUpdateToSplitTransaction: CommandFunctionWithPreviousSubject<typeof requestUpdateToSplitTransaction>;
      requestDeleteTransaction: CommandFunctionWithPreviousSubject<typeof requestDeleteTransaction>;
      requestGetTransactionList: CommandFunctionWithPreviousSubject<typeof requestGetTransactionList>;
    }

    interface ChainableResponseBody extends Chainable {
      validateTransactionPaymentDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionPaymentDocument>;
      validateTransactionResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionResponse>;
    }
  }
}
