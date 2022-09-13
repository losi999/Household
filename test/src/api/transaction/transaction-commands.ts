import { Account, Category, Transaction } from '@household/shared/types/types';
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

const validateInventoryDocument = (request: Transaction.Inventory, document: Transaction.Inventory, category?: Category.Document) => {
  if (category?.categoryType === 'inventory' && request.inventory) {
    expect(document.inventory.brand, 'inventory.brand').to.equal(request.inventory.brand);
    expect(document.inventory.measurement, 'inventory.measurement').to.equal(request.inventory.measurement);
    expect(document.inventory.quantity, 'inventory.quantity').to.equal(request.inventory.quantity);
    expect(document.inventory.unitOfMeasurement, 'inventory.unitOfMeasurement').to.equal(request.inventory.unitOfMeasurement);
  } else {
    expect(document.inventory, 'inventory').to.equal(undefined);
  }
};

const validateInvoiceDocument = (request: Transaction.Invoice<string>, document: Transaction.Invoice<Date>, category?: Category.Document) => {
  if (category?.categoryType === 'invoice' && request.invoice) {
    expect(document.invoice.invoiceNumber, 'invoice.invoiceNumber').to.equal(request.invoice.invoiceNumber);
    expect(new Date(document.invoice.billingStartDate).toISOString(), 'invoice.billingStartDate').to.equal(new Date(request.invoice.billingStartDate).toISOString());
    expect(new Date(document.invoice.billingEndDate).toISOString(), 'invoice.billingEndDate').to.equal(new Date(request.invoice.billingEndDate).toISOString());
  } else {
    expect(document.invoice, 'invoice').to.equal(undefined);
  }
};

const validateTransactionPaymentDocument = (response: Transaction.Id, request: Transaction.PaymentRequest, category?: Category.Document) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .transactionTask('getTransactionById', [id])
    .should((document: Transaction.PaymentDocument) => {
      expect(document._id.toString(), 'id').to.equal(id);
      expect(document.amount, 'amount').to.equal(request.amount);
      expect(new Date(document.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(request.issuedAt).toISOString());
      expect(document.transactionType, 'transactionType').to.equal('payment');
      expect(document.description, 'description').to.equal(request.description);
      expect(document.account._id.toString(), 'account').to.equal(request.accountId);
      expect(document.category?._id.toString(), 'category').to.equal(request.categoryId);
      expect(document.project?._id.toString(), 'project').to.equal(request.projectId);
      expect(document.recipient?._id.toString(), 'recipient').to.equal(request.recipientId);

      validateInventoryDocument(request, document, category);
      validateInvoiceDocument(request, document, category);
    });
};

const validateTransactionSplitDocument = (response: Transaction.Id, request: Transaction.SplitRequest, ...categories: Category.Document[]) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .transactionTask('getTransactionById', [id])
    .should((document: Transaction.SplitDocument) => {
      expect(document._id.toString(), 'id').to.equal(id);
      expect(document.amount, 'amount').to.equal(request.amount);
      expect(new Date(document.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(request.issuedAt).toISOString());
      expect(document.transactionType, 'transactionType').to.equal('split');
      expect(document.description, 'description').to.equal(request.description);
      expect(document.account._id.toString(), 'account').to.equal(request.accountId);
      expect(document.recipient?._id.toString(), 'recipient').to.equal(request.recipientId);

      document.splits.forEach((split, index) => {
        expect(split.amount, `splits.amount${index}`).to.equal(request.splits[index].amount);
        expect(split.description, `splits.description${index}`).to.equal(request.splits[index].description);
        expect(split.project?._id.toString(), `splits.project${index}`).to.equal(request.splits[index].projectId);
        expect(split.category?._id.toString(), `splits.category${index}`).to.equal(request.splits[index].categoryId);

        const category = categories.find(c => c._id.toString() === split.category?._id.toString());

        validateInventoryDocument(request.splits[index], split, category);
        validateInvoiceDocument(request.splits[index], split, category);
      });
    });
};

const validateTransactionTransferDocument = (response: Transaction.Id, request: Transaction.TransferRequest) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .transactionTask('getTransactionById', [id])
    .should((document: Transaction.TransferDocument) => {
      expect(document._id.toString(), 'id').to.equal(id);
      expect(document.amount, 'amount').to.equal(request.amount);
      expect(new Date(document.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(request.issuedAt).toISOString());
      expect(document.transactionType, 'transactionType').to.equal('transfer');
      expect(document.description, 'description').to.equal(request.description);
      expect(document.account._id.toString(), 'account').to.equal(request.accountId);
      expect(document.transferAccount._id.toString(), 'account').to.equal(request.transferAccountId);
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

const saveTransactionDocument = (document: Transaction.Document) => {
  cy.transactionTask('saveTransaction', [document]);
};

export const setTransactionCommands = () => {
  Cypress.Commands.addAll<any>({
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
    validateTransactionPaymentDocument,
    validateTransactionTransferDocument,
    validateTransactionSplitDocument,
    validateTransactionResponse,
  });

  Cypress.Commands.addAll({
    transactionTask,
    saveTransactionDocument,
    validateTransactionDeleted,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateTransactionDeleted: CommandFunction<typeof validateTransactionDeleted>;
      saveTransactionDocument: CommandFunction<typeof saveTransactionDocument>;
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
      validateTransactionTransferDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionTransferDocument>;
      validateTransactionSplitDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionSplitDocument>;
      validateTransactionResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionResponse>;
    }
  }
}
