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

const validateInventoryDocument = (request: Transaction.Inventory, document: Transaction.Inventory, category?: Category.Document) => {
  if (category?.categoryType === 'inventory' && document.inventory) {
    expect(document.inventory.brand, 'inventory.brand').to.equal(request.inventory.brand);
    expect(document.inventory.measurement, 'inventory.measurement').to.equal(request.inventory.measurement);
    expect(document.inventory.quantity, 'inventory.quantity').to.equal(request.inventory.quantity);
    expect(document.inventory.unitOfMeasurement, 'inventory.unitOfMeasurement').to.equal(request.inventory.unitOfMeasurement);
  } else {
    expect(document.inventory, 'inventory').to.equal(undefined);
  }
};

const validateInvoiceDocument = (request: Transaction.Invoice<string>, document: Transaction.Invoice<Date>, category?: Category.Document) => {
  if (category?.categoryType === 'invoice' && document.invoice) {
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

const validateTransactionPaymentResponse = (response: Transaction.PaymentResponse, document: Transaction.PaymentDocument) => {
  expect(response.transactionId).to.equal(document._id.toString());
  expect(response.amount, 'amount').to.equal(document.amount);
  expect(new Date(response.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(document.issuedAt).toISOString());
  expect(response.transactionType, 'transactionType').to.equal('payment');
  expect(response.description, 'description').to.equal(document.description);
  expect(response.account.accountId, 'account.accountId').to.equal(document.account._id.toString());
  expect(response.account.accountType, 'account.accountType').to.equal(document.account.accountType);
  expect(response.account.balance, 'account.balance').to.equal(document.account.balance ?? null);
  expect(response.account.currency, 'account.currency').to.equal(document.account.currency);
  expect(response.account.isOpen, 'account.isOpen').to.equal(document.account.isOpen);
  expect(response.account.name, 'account.name').to.equal(document.account.name);

  expect(response.project?.projectId, 'project.projectId').to.equal(document.project?._id.toString());
  expect(response.project?.name, 'project.name').to.equal(document.project?.name);
  expect(response.project?.description, 'project.description').to.equal(document.project?.description);

  expect(response.recipient?.recipientId, 'recipient.recipientId').to.equal(document.recipient?._id.toString());
  expect(response.recipient?.name, 'recipient.name').to.equal(document.recipient?.name);

  expect(response.category?.categoryId, 'category.categoryId').to.equal(document.category?._id.toString());
  expect(response.category?.categoryType, 'category.categoryType').to.equal(document.category?.categoryType);
  expect(response.category?.fullName, 'category.fullName').to.equal(document.category?.fullName);
  expect(response.category?.name, 'category.name').to.equal(document.category?.name);

  if(response.category?.categoryType === 'inventory') {
    expect(response.inventory?.brand, 'inventory.brand').to.equal(document.inventory?.brand);
    expect(response.inventory?.measurement, 'inventory.measurement').to.equal(document.inventory?.measurement);
    expect(response.inventory?.quantity, 'inventory.quantity').to.equal(document.inventory?.quantity);
    expect(response.inventory?.unitOfMeasurement, 'inventory.unitOfMeasurement').to.equal(document.inventory?.unitOfMeasurement);
  } else {
    expect(response.inventory, 'inventory').to.equal(undefined);
  }

  if(response.category?.categoryType === 'invoice') {
    expect(response.invoice?.invoiceNumber, 'invoice.invoiceNumber').to.equal(document.invoice?.invoiceNumber);
    expect(new Date(response.invoice?.billingStartDate).toISOString(), 'invoice.billingStartDate').to.equal(new Date(document.invoice?.billingStartDate).toISOString());
    expect(new Date(response.invoice?.billingEndDate).toISOString(), 'invoice.billingEndDate').to.equal(new Date(document.invoice?.billingEndDate).toISOString());
  } else {
    expect(response.invoice, 'invoice').to.equal(undefined);
  }
};

const validateTransactionTransferResponse = (response: Transaction.TransferResponse, document: Transaction.TransferDocument) => {
  expect(response.transactionId).to.equal(document._id.toString());
  expect(response.amount, 'amount').to.equal(document.amount);
  expect(new Date(response.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(document.issuedAt).toISOString());
  expect(response.transactionType, 'transactionType').to.equal('transfer');
  expect(response.description, 'description').to.equal(document.description);
  expect(response.account.accountId, 'account.accountId').to.equal(document.account._id.toString());
  expect(response.account.accountType, 'account.accountType').to.equal(document.account.accountType);
  expect(response.account.balance, 'account.balance').to.equal(document.account.balance ?? null);
  expect(response.account.currency, 'account.currency').to.equal(document.account.currency);
  expect(response.account.isOpen, 'account.isOpen').to.equal(document.account.isOpen);
  expect(response.account.name, 'account.name').to.equal(document.account.name);
  expect(response.transferAccount.accountId, 'transferAccount.accountId').to.equal(document.transferAccount._id.toString());
  expect(response.transferAccount.accountType, 'transferAccount.accountType').to.equal(document.transferAccount.accountType);
  expect(response.transferAccount.balance, 'transferAccount.balance').to.equal(document.transferAccount.balance ?? null);
  expect(response.transferAccount.currency, 'transferAccount.currency').to.equal(document.transferAccount.currency);
  expect(response.transferAccount.isOpen, 'transferAccount.isOpen').to.equal(document.transferAccount.isOpen);
  expect(response.transferAccount.name, 'transferAccount.name').to.equal(document.transferAccount.name);

};

const validateTransactionSplitResponse = (response: Transaction.SplitResponse, document: Transaction.SplitDocument) => {
  expect(response.transactionId).to.equal(document._id.toString());
  expect(response.amount, 'amount').to.equal(document.amount);
  expect(new Date(response.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(document.issuedAt).toISOString());
  expect(response.transactionType, 'transactionType').to.equal('split');
  expect(response.description, 'description').to.equal(document.description);
  expect(response.account.accountId, 'account.accountId').to.equal(document.account._id.toString());
  expect(response.account.accountType, 'account.accountType').to.equal(document.account.accountType);
  expect(response.account.balance, 'account.balance').to.equal(document.account.balance ?? null);
  expect(response.account.currency, 'account.currency').to.equal(document.account.currency);
  expect(response.account.isOpen, 'account.isOpen').to.equal(document.account.isOpen);
  expect(response.account.name, 'account.name').to.equal(document.account.name);

  expect(response.recipient?.recipientId, 'recipient.recipientId').to.equal(document.recipient?._id.toString());
  expect(response.recipient?.name, 'recipient.name').to.equal(document.recipient?.name);

  response.splits.forEach((split, index) => {
    expect(split.project?.projectId, 'project.projectId').to.equal(document.splits[index].project?._id.toString());
    expect(split.project?.name, 'project.name').to.equal(document.splits[index].project?.name);
    expect(split.project?.description, 'project.description').to.equal(document.splits[index].project?.description);

    expect(split.category?.categoryId, 'category.categoryId').to.equal(document.splits[index].category?._id.toString());
    expect(split.category?.categoryType, 'category.categoryType').to.equal(document.splits[index].category?.categoryType);
    expect(split.category?.fullName, 'category.fullName').to.equal(document.splits[index].category?.fullName);
    expect(split.category?.name, 'category.name').to.equal(document.splits[index].category?.name);

    if(split.category?.categoryType === 'inventory') {
      expect(split.inventory?.brand, 'inventory.brand').to.equal(document.splits[index].inventory?.brand);
      expect(split.inventory?.measurement, 'inventory.measurement').to.equal(document.splits[index].inventory?.measurement);
      expect(split.inventory?.quantity, 'inventory.quantity').to.equal(document.splits[index].inventory?.quantity);
      expect(split.inventory?.unitOfMeasurement, 'inventory.unitOfMeasurement').to.equal(document.splits[index].inventory?.unitOfMeasurement);
    } else {
      expect(split.inventory, 'inventory').to.equal(undefined);
    }

    if(split.category?.categoryType === 'invoice') {
      expect(split.invoice?.invoiceNumber, 'invoice.invoiceNumber').to.equal(document.splits[index].invoice?.invoiceNumber);
      expect(new Date(split.invoice?.billingStartDate).toISOString(), 'invoice.billingStartDate').to.equal(new Date(document.splits[index].invoice?.billingStartDate).toISOString());
      expect(new Date(split.invoice?.billingEndDate).toISOString(), 'invoice.billingEndDate').to.equal(new Date(document.splits[index].invoice?.billingEndDate).toISOString());
    } else {
      expect(split.invoice, 'invoice').to.equal(undefined);
    }
  });
};

const validateTransactionDeleted = (transactionId: Transaction.IdType) => {
  cy.log('Get transaction document', transactionId)
    .transactionTask('getTransactionById', [transactionId])
    .should((document) => {
      expect(document).to.be.null;
    });
};

const validateRecipientUnset = (transactionId: Transaction.IdType) => {
  cy.log('Get transaction document', transactionId)
    .transactionTask('getTransactionById', [transactionId])
    .should((document: Transaction.Document) => {
      if (document.transactionType !== 'transfer') {
        expect(document.recipient, 'recipient').to.be.undefined;
      }
    });
};

const validateProjectUnset = (transactionId: Transaction.IdType, splitIndex?: number) => {
  cy.log('Get transaction document', transactionId)
    .transactionTask('getTransactionById', [transactionId])
    .should((document: Transaction.Document) => {
      switch(document.transactionType) {
        case 'payment': {
          expect(document.project, 'project').to.be.undefined;
          break;
        }
        case 'split': {
          expect(document.splits[splitIndex].project, 'splits.project').to.be.undefined;
          break;
        }
      }
    });
};

const validateCategoryUnset = (transactionId: Transaction.IdType, splitIndex?: number) => {
  cy.log('Get transaction document', transactionId)
    .transactionTask('getTransactionById', [transactionId])
    .should((document: Transaction.Document) => {
      switch(document.transactionType) {
        case 'payment': {
          expect(document.category, 'category').to.be.undefined;
          break;
        }
        case 'split': {
          expect(document.splits[splitIndex].category, 'splits.category').to.be.undefined;
          break;
        }
      }
    });
};

const validateCategoryUpdate = (transactionId: Transaction.IdType, newValue: Category.IdType, splitIndex?: number) => {
  cy.log('Get transaction document', transactionId)
    .transactionTask('getTransactionById', [transactionId])
    .should((document: Transaction.Document) => {
      switch(document.transactionType) {
        case 'payment': {
          expect(document.category._id.toString(), 'category').to.equal(newValue);
          break;
        }
        case 'split': {
          expect(document.splits[splitIndex].category._id.toString(), 'splits.category').to.equal(newValue);
          break;
        }
      }
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
    validateTransactionPaymentDocument,
    validateTransactionTransferDocument,
    validateTransactionSplitDocument,
    validateTransactionPaymentResponse,
    validateTransactionTransferResponse,
    validateTransactionSplitResponse,
  });

  Cypress.Commands.addAll({
    validateProjectUnset,
    validateCategoryUnset,
    validateCategoryUpdate,
    validateRecipientUnset,
    transactionTask,
    saveTransactionDocument,
    validateTransactionDeleted,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateTransactionDeleted: CommandFunction<typeof validateTransactionDeleted>;
      validateProjectUnset: CommandFunction<typeof validateProjectUnset>;
      validateCategoryUnset: CommandFunction<typeof validateCategoryUnset>;
      validateCategoryUpdate: CommandFunction<typeof validateCategoryUpdate>;
      validateRecipientUnset: CommandFunction<typeof validateRecipientUnset>;
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
    }

    interface ChainableResponseBody extends Chainable {
      validateTransactionPaymentDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionPaymentDocument>;
      validateTransactionTransferDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionTransferDocument>;
      validateTransactionSplitDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionSplitDocument>;
      validateTransactionPaymentResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionPaymentResponse>;
      validateTransactionTransferResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionTransferResponse>;
      validateTransactionSplitResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionSplitResponse>;
    }
  }
}
