import { Account, Category, Common, Product, Transaction } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';

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

const requestGetTransactionListByAccount = (idToken: string, accountId: Account.IdType, querystring?: Common.Pagination<number>) => {
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

const validateInventoryDocument = (request: Transaction.Inventory<Product.Id>, document: Transaction.Inventory<Transaction.Product<Product.Document>>, categoryId: Category.IdType, productId: Product.IdType) => {
  let category: Category.Document;

  cy.log('Get category document', categoryId)
    .getCategoryDocumentById(categoryId)
    .then((doc) => category = doc)
    .log('Get product document', productId)
    .getProductDocumentById(productId)
    .should((product) => {
      if (category?.categoryType === 'inventory' && document.inventory) {
        expect(document.inventory.quantity, 'inventory.quantity').to.equal(request.inventory.quantity);
        expect(getProductId(document.inventory.product), 'inventory.product.productId').to.equal(request.inventory.productId);
        expect(document.inventory.product.brand, 'inventory.product.brand').to.equal(product.brand);
        expect(document.inventory.product.measurement, 'inventory.product.measurement').to.equal(product.measurement);
        expect(document.inventory.product.unitOfMeasurement, 'inventory.unitOfMeasurement').to.equal(product.unitOfMeasurement);
      } else {
        expect(document.inventory, 'inventory').to.equal(undefined);
      }
    });
};

const validateInvoiceDocument = (request: Transaction.Invoice<string>, document: Transaction.Invoice<Date>, categoryId: Category.IdType) => {
  cy.log('Get category document', categoryId)
    .getCategoryDocumentById(categoryId)
    .should((category) => {
      if (category?.categoryType === 'invoice' && document.invoice) {
        expect(document.invoice.invoiceNumber, 'invoice.invoiceNumber').to.equal(request.invoice.invoiceNumber);
        expect(new Date(document.invoice.billingStartDate).toISOString(), 'invoice.billingStartDate').to.equal(new Date(request.invoice.billingStartDate).toISOString());
        expect(new Date(document.invoice.billingEndDate).toISOString(), 'invoice.billingEndDate').to.equal(new Date(request.invoice.billingEndDate).toISOString());
      } else {
        expect(document.invoice, 'invoice').to.equal(undefined);
      }
    });
};

const validateTransactionPaymentDocument = (response: Transaction.Id, request: Transaction.PaymentRequest) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .getTransactionDocumentById(id)
    .should((document: Transaction.PaymentDocument) => {
      expect(getTransactionId(document), 'id').to.equal(id);
      expect(document.amount, 'amount').to.equal(request.amount);
      expect(new Date(document.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(request.issuedAt).toISOString());
      expect(document.transactionType, 'transactionType').to.equal('payment');
      expect(document.description, 'description').to.equal(request.description);
      expect(getAccountId(document.account), 'account').to.equal(request.accountId);
      expect(getCategoryId(document.category), 'category').to.equal(request.categoryId);
      expect(getProjectId(document.project), 'project').to.equal(request.projectId);
      expect(getRecipientId(document.recipient), 'recipient').to.equal(request.recipientId);

      validateInventoryDocument(request, document, getCategoryId(document.category), getProductId(document.inventory?.product));
      validateInvoiceDocument(request, document, getCategoryId(document.category));
    });
};

const validateTransactionSplitDocument = (response: Transaction.Id, request: Transaction.SplitRequest) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .getTransactionDocumentById(id)
    .should((document: Transaction.SplitDocument) => {
      expect(getTransactionId(document), 'id').to.equal(id);
      expect(document.amount, 'amount').to.equal(request.amount);
      expect(new Date(document.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(request.issuedAt).toISOString());
      expect(document.transactionType, 'transactionType').to.equal('split');
      expect(document.description, 'description').to.equal(request.description);
      expect(getAccountId(document.account), 'account').to.equal(request.accountId);
      expect(getRecipientId(document.recipient), 'recipient').to.equal(request.recipientId);

      document.splits.forEach((split, index) => {
        expect(split.amount, `splits.amount${index}`).to.equal(request.splits[index].amount);
        expect(split.description, `splits.description${index}`).to.equal(request.splits[index].description);
        expect(getProjectId(split.project), `splits.project${index}`).to.equal(request.splits[index].projectId);
        expect(getCategoryId(split.category), `splits.category${index}`).to.equal(request.splits[index].categoryId);

        validateInventoryDocument(request.splits[index], split, getCategoryId(split.category), getProductId(split.inventory?.product));
        validateInvoiceDocument(request.splits[index], split, getCategoryId(split.category));
      });
    });
};

const validateTransactionTransferDocument = (response: Transaction.Id, request: Transaction.TransferRequest) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .getTransactionDocumentById(id)
    .should((document: Transaction.TransferDocument) => {
      expect(getTransactionId(document), 'id').to.equal(id);
      expect(document.amount, 'amount').to.equal(request.amount);
      expect(new Date(document.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(request.issuedAt).toISOString());
      expect(document.transactionType, 'transactionType').to.equal('transfer');
      expect(document.description, 'description').to.equal(request.description);
      expect(getAccountId(document.account), 'account').to.equal(request.accountId);
      expect(getAccountId(document.transferAccount), 'account').to.equal(request.transferAccountId);
    });
};

const validateTransactionPaymentResponse = (response: Transaction.PaymentResponse, document: Transaction.PaymentDocument) => {
  expect(response.transactionId).to.equal(getTransactionId(document));
  expect(response.amount, 'amount').to.equal(document.amount);
  expect(new Date(response.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(document.issuedAt).toISOString());
  expect(response.transactionType, 'transactionType').to.equal('payment');
  expect(response.description, 'description').to.equal(document.description);
  expect(response.account.accountId, 'account.accountId').to.equal(getAccountId(document.account));
  expect(response.account.accountType, 'account.accountType').to.equal(document.account.accountType);
  expect(response.account.balance, 'account.balance').to.equal(document.account.balance ?? null);
  expect(response.account.currency, 'account.currency').to.equal(document.account.currency);
  expect(response.account.isOpen, 'account.isOpen').to.equal(document.account.isOpen);
  expect(response.account.name, 'account.name').to.equal(document.account.name);

  expect(response.project?.projectId, 'project.projectId').to.equal(getProjectId(document.project));
  expect(response.project?.name, 'project.name').to.equal(document.project?.name);
  expect(response.project?.description, 'project.description').to.equal(document.project?.description);

  expect(response.recipient?.recipientId, 'recipient.recipientId').to.equal(getRecipientId(document.recipient));
  expect(response.recipient?.name, 'recipient.name').to.equal(document.recipient?.name);

  expect(response.category?.categoryId, 'category.categoryId').to.equal(getCategoryId(document.category));
  expect(response.category?.categoryType, 'category.categoryType').to.equal(document.category?.categoryType);
  expect(response.category?.fullName, 'category.fullName').to.equal(document.category?.fullName);
  expect(response.category?.name, 'category.name').to.equal(document.category?.name);

  if(response.category?.categoryType === 'inventory') {
    expect(response.inventory?.quantity, 'inventory.quantity').to.equal(document.inventory?.quantity);
    expect(response.inventory?.product.productId, 'inventory.productId').to.equal(getProductId(document.inventory?.product));
    expect(response.inventory?.product.brand, 'inventory.product.brand').to.equal(document.inventory?.product.brand);
    expect(response.inventory?.product.measurement, 'inventory.product.measurement').to.equal(document.inventory?.product.measurement);
    expect(response.inventory?.product.unitOfMeasurement, 'inventory.product.unitOfMeasurement').to.equal(document.inventory?.product.unitOfMeasurement);
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
  expect(response.transactionId).to.equal(getTransactionId(document));
  expect(response.amount, 'amount').to.equal(document.amount);
  expect(new Date(response.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(document.issuedAt).toISOString());
  expect(response.transactionType, 'transactionType').to.equal('transfer');
  expect(response.description, 'description').to.equal(document.description);
  expect(response.account.accountId, 'account.accountId').to.equal(getAccountId(document.account));
  expect(response.account.accountType, 'account.accountType').to.equal(document.account.accountType);
  expect(response.account.balance, 'account.balance').to.equal(document.account.balance ?? null);
  expect(response.account.currency, 'account.currency').to.equal(document.account.currency);
  expect(response.account.isOpen, 'account.isOpen').to.equal(document.account.isOpen);
  expect(response.account.name, 'account.name').to.equal(document.account.name);
  expect(response.transferAccount.accountId, 'transferAccount.accountId').to.equal(getAccountId(document.transferAccount));
  expect(response.transferAccount.accountType, 'transferAccount.accountType').to.equal(document.transferAccount.accountType);
  expect(response.transferAccount.balance, 'transferAccount.balance').to.equal(document.transferAccount.balance ?? null);
  expect(response.transferAccount.currency, 'transferAccount.currency').to.equal(document.transferAccount.currency);
  expect(response.transferAccount.isOpen, 'transferAccount.isOpen').to.equal(document.transferAccount.isOpen);
  expect(response.transferAccount.name, 'transferAccount.name').to.equal(document.transferAccount.name);

};

const validateTransactionSplitResponse = (response: Transaction.SplitResponse, document: Transaction.SplitDocument) => {
  expect(response.transactionId).to.equal(getTransactionId(document));
  expect(response.amount, 'amount').to.equal(document.amount);
  expect(new Date(response.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(document.issuedAt).toISOString());
  expect(response.transactionType, 'transactionType').to.equal('split');
  expect(response.description, 'description').to.equal(document.description);
  expect(response.account.accountId, 'account.accountId').to.equal(getAccountId(document.account));
  expect(response.account.accountType, 'account.accountType').to.equal(document.account.accountType);
  expect(response.account.balance, 'account.balance').to.equal(document.account.balance ?? null);
  expect(response.account.currency, 'account.currency').to.equal(document.account.currency);
  expect(response.account.isOpen, 'account.isOpen').to.equal(document.account.isOpen);
  expect(response.account.name, 'account.name').to.equal(document.account.name);

  expect(response.recipient?.recipientId, 'recipient.recipientId').to.equal(getRecipientId(document.recipient));
  expect(response.recipient?.name, 'recipient.name').to.equal(document.recipient?.name);

  response.splits.forEach((split, index) => {
    expect(split.project?.projectId, 'project.projectId').to.equal(getProjectId(document.splits[index].project));
    expect(split.project?.name, 'project.name').to.equal(document.splits[index].project?.name);
    expect(split.project?.description, 'project.description').to.equal(document.splits[index].project?.description);

    expect(split.category?.categoryId, 'category.categoryId').to.equal(getCategoryId(document.splits[index].category));
    expect(split.category?.categoryType, 'category.categoryType').to.equal(document.splits[index].category?.categoryType);
    expect(split.category?.fullName, 'category.fullName').to.equal(document.splits[index].category?.fullName);
    expect(split.category?.name, 'category.name').to.equal(document.splits[index].category?.name);

    if(split.category?.categoryType === 'inventory') {
      expect(split.inventory?.quantity, 'inventory.quantity').to.equal(document.splits[index].inventory?.quantity);
      expect(split.inventory?.product.productId, 'inventory.product.productId').to.equal(getProductId(document.splits[index].inventory?.product));
      expect(split.inventory?.product.brand, 'inventory.product.brand').to.equal(document.splits[index].inventory?.product.brand);
      expect(split.inventory?.product.measurement, 'inventory.product.measurement').to.equal(document.splits[index].inventory?.product.measurement);
      expect(split.inventory?.product.unitOfMeasurement, 'inventory.product.unitOfMeasurement').to.equal(document.splits[index].inventory?.product.unitOfMeasurement);
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

const validateTransactionListResponse = (responses: Transaction.Response[], documents: Transaction.Document[]) => {
  documents.forEach((document) => {
    const response = responses.find(r => r.transactionId === getTransactionId(document));
    switch(response.transactionType) {
      case 'payment': validateTransactionPaymentResponse(response, document as Transaction.PaymentDocument); break;
      case 'transfer': validateTransactionTransferResponse(response, document as Transaction.TransferDocument); break;
      case 'split': validateTransactionSplitResponse(response, document as Transaction.SplitDocument); break;
    }
  });
};

const validateTransactionDeleted = (transactionId: Transaction.IdType) => {
  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((document) => {
      expect(document).to.be.null;
    });
};

const validateRecipientUnset = (transactionId: Transaction.IdType) => {
  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((document: Transaction.Document) => {
      if (document.transactionType !== 'transfer') {
        expect(document.recipient, 'recipient').to.be.undefined;
      }
    });
};

const validateProjectUnset = (transactionId: Transaction.IdType, splitIndex?: number) => {
  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
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
    .getTransactionDocumentById(transactionId)
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
    .getTransactionDocumentById(transactionId)
    .should((document: Transaction.Document) => {
      switch(document.transactionType) {
        case 'payment': {
          expect(getCategoryId(document.category), 'category').to.equal(newValue);
          break;
        }
        case 'split': {
          expect(getCategoryId(document.splits[splitIndex].category), 'splits.category').to.equal(newValue);
          break;
        }
      }
    });
};

const saveTransactionDocument = (...params: Parameters<ITransactionService['saveTransaction']>) => {
  return cy.task<Transaction.Document>('saveTransaction', ...params);
};

const getTransactionDocumentById = (...params: Parameters<ITransactionService['getTransactionById']>) => {
  return cy.task<Transaction.Document>('getTransactionById', ...params);
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
    requestGetTransactionListByAccount,
    validateTransactionPaymentDocument,
    validateTransactionTransferDocument,
    validateTransactionSplitDocument,
    validateTransactionPaymentResponse,
    validateTransactionTransferResponse,
    validateTransactionSplitResponse,
    validateTransactionListResponse,
  });

  Cypress.Commands.addAll({
    validateProjectUnset,
    validateCategoryUnset,
    validateCategoryUpdate,
    validateRecipientUnset,
    getTransactionDocumentById,
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
      getTransactionDocumentById: CommandFunction<typeof getTransactionDocumentById>
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
      requestGetTransactionListByAccount: CommandFunctionWithPreviousSubject<typeof requestGetTransactionListByAccount>;
    }

    interface ChainableResponseBody extends Chainable {
      validateTransactionPaymentDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionPaymentDocument>;
      validateTransactionTransferDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionTransferDocument>;
      validateTransactionSplitDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionSplitDocument>;
      validateTransactionPaymentResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionPaymentResponse>;
      validateTransactionTransferResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionTransferResponse>;
      validateTransactionSplitResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionSplitResponse>;
      validateTransactionListResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionListResponse>;
    }
  }
}
