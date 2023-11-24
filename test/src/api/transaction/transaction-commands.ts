import { Account, Category, Common, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';

type RelatedDocument = 'category' | 'project' | 'recipient' | 'inventory' | 'invoice';

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

const validateInventoryDocument = (request: Transaction.InventoryRequest['inventory'], document: Transaction.Inventory<Product.Document>['inventory'], category: Category.Document) => {
  if (category?.categoryType === 'inventory') {
    expect(document?.quantity, 'inventory.quantity').to.equal(request?.quantity);
    expect(getProductId(document?.product), 'inventory.productId').to.equal(request?.productId);
  } else {
    expect(document, 'inventory').to.equal(undefined);
  }
};

const validateInvoiceDocument = (request: Transaction.Invoice<string>['invoice'], document: Transaction.Invoice<Date>['invoice'], category: Category.Document) => {
  if (category?.categoryType === 'invoice' && document) {
    expect(document?.invoiceNumber, 'invoice.invoiceNumber').to.equal(request.invoiceNumber);
    expect(new Date(document.billingStartDate).toISOString(), 'invoice.billingStartDate').to.equal(new Date(request.billingStartDate).toISOString());
    expect(new Date(document.billingEndDate).toISOString(), 'invoice.billingEndDate').to.equal(new Date(request.billingEndDate).toISOString());
  } else {
    expect(document, 'invoice').to.equal(undefined);
  }
};

const validateTransactionPaymentDocument = (response: Transaction.TransactionId, request: Transaction.PaymentRequest) => {
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

      validateInventoryDocument(request.inventory, document.inventory, document.category);
      validateInvoiceDocument(request.invoice, document.invoice, document.category);
    });
};

const validateTransactionSplitDocument = (response: Transaction.TransactionId, request: Transaction.SplitRequest) => {
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

        validateInventoryDocument(request.splits[index].inventory, split.inventory, split.category);
        validateInvoiceDocument(request.splits[index].invoice, split.invoice, split.category);
      });
    });
};

const validateTransactionTransferDocument = (response: Transaction.TransactionId, request: Transaction.TransferRequest) => {
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

const validateTransactionDeleted = (transactionId: Transaction.Id) => {
  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((document) => {
      expect(document).to.be.null;
    });
};

const compareTransactionDocuments = (original: Transaction.Document, current: Transaction.Document) => {
  expect(getTransactionId(original), 'id').to.equal(getTransactionId(current));
  expect(original.amount, 'amount').to.equal(current.amount);
  expect(new Date(original.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(current.issuedAt).toISOString());
  expect(original.transactionType, 'transactionType').to.equal(current.transactionType);
  expect(original.description, 'description').to.equal(current.description);
  expect(getAccountId(original.account), 'account').to.equal(getAccountId(current.account));
};

const validatePartiallyUnsetPaymentDocument = (originalDocument: Transaction.PaymentDocument, ...relatedDocumentToUnset: RelatedDocument[]) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((currentDocument: Transaction.PaymentDocument) => {
      compareTransactionDocuments(originalDocument, currentDocument);

      if (relatedDocumentToUnset?.includes('recipient')) {
        expect(currentDocument.recipient, 'recipient').to.be.undefined;
      } else {
        expect(getRecipientId(originalDocument.recipient), 'recipient').to.equal(getRecipientId(currentDocument.recipient));
      }

      if (relatedDocumentToUnset?.includes('project')) {
        expect(currentDocument.project, 'project').to.be.undefined;
      } else {
        expect(getProjectId(originalDocument.project), 'project').to.equal(getProjectId(currentDocument.project));
      }

      if (relatedDocumentToUnset?.includes('category')) {
        expect(currentDocument.category, 'category').to.be.undefined;
      } else {
        expect(getCategoryId(originalDocument.category), 'category').to.equal(getCategoryId(currentDocument.category));
      }

      if (relatedDocumentToUnset?.includes('inventory')) {
        expect(currentDocument.inventory, 'inventory').to.be.undefined;
      } else {
        expect(originalDocument.inventory?.quantity, 'inventory.quantity').to.equal(currentDocument.inventory?.quantity);
        expect(getProductId(originalDocument.inventory?.product), 'inventory.product').to.equal(getProductId(currentDocument.inventory?.product));
      }

      if (relatedDocumentToUnset?.includes('invoice')) {
        expect(currentDocument.invoice, 'invoice').to.be.undefined;
      } else {
        expect(originalDocument.invoice?.invoiceNumber, 'invoice.invoiceNumber').to.equal(currentDocument.invoice?.invoiceNumber);
        expect(originalDocument.invoice?.billingEndDate, 'invoice.billingEndDate').to.equal(currentDocument.invoice?.billingEndDate);
        expect(originalDocument.invoice?.billingStartDate, 'invoice.billingStartDate').to.equal(currentDocument.invoice?.billingStartDate);
      }
    });
};

const validatePartiallyUnsetSplitDocument = (originalDocument: Transaction.SplitDocument, splitIndex: number, ...relatedDocumentToUnset: RelatedDocument[]) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((currentDocument: Transaction.SplitDocument) => {
      compareTransactionDocuments(originalDocument, currentDocument);

      if (relatedDocumentToUnset?.includes('recipient')) {
        expect(currentDocument.recipient, 'recipient').to.be.undefined;
      } else {
        expect(getRecipientId(originalDocument.recipient), 'recipient').to.equal(getRecipientId(currentDocument.recipient));
      }

      currentDocument.splits.forEach((split, index) => {
        if (relatedDocumentToUnset?.includes('project') && index === splitIndex) {
          expect(split.project, `[${index}].project`).to.be.undefined;
        } else {
          expect(getProjectId(originalDocument.splits[index].project), `[${index}].project`).to.equal(getProjectId(split.project));
        }

        if (relatedDocumentToUnset?.includes('category') && index === splitIndex) {
          expect(split.category, `[${index}].category`).to.be.undefined;
        } else {
          expect(getCategoryId(originalDocument.splits[index].category), `[${index}].category`).to.equal(getCategoryId(split.category));
        }

        if (relatedDocumentToUnset?.includes('inventory') && index === splitIndex) {
          expect(split.inventory, `[${index}].inventory`).to.be.undefined;
        } else {
          expect(originalDocument.splits[index].inventory?.quantity, `[${index}].inventory.quantity`).to.equal(split.inventory?.quantity);
          expect(getProductId(originalDocument.splits[index].inventory?.product), `[${index}].inventory.product`).to.equal(getProductId(split.inventory?.product));
        }

        if (relatedDocumentToUnset?.includes('invoice') && index === splitIndex) {
          expect(split.invoice, `[${index}].invoice`).to.be.undefined;
        } else {
          expect(originalDocument.splits[index].invoice?.invoiceNumber, `[${index}].invoice.invoiceNumber`).to.equal(split.invoice?.invoiceNumber);
          expect(originalDocument.splits[index].invoice?.billingEndDate, `[${index}].invoice.billingEndDate`).to.equal(split.invoice?.billingEndDate);
          expect(originalDocument.splits[index].invoice?.billingStartDate, `[${index}].invoice.billingStartDate`).to.equal(split.invoice?.billingStartDate);
        }
      });
    });
};

const validatePartiallyReassignedPaymentDocument = (originalDocument: Transaction.PaymentDocument, reassignments: {
  recipient?: Recipient.Id;
  project?: Project.Id;
  product?: Product.Id;
  category?: Category.Id;
}) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((currentDocument: Transaction.PaymentDocument) => {
      compareTransactionDocuments(originalDocument, currentDocument);

      if (reassignments.recipient) {
        expect(getRecipientId(currentDocument.recipient), 'recipient').to.equal(reassignments.recipient);
      } else {
        expect(getRecipientId(originalDocument.recipient), 'recipient').to.equal(getRecipientId(currentDocument.recipient));
      }

      if (reassignments.project) {
        expect(getProjectId(currentDocument.project), 'project').to.equal(reassignments.project);
      } else {
        expect(getProjectId(originalDocument.project), 'project').to.equal(getProjectId(currentDocument.project));
      }

      if (reassignments.category) {
        expect(getCategoryId(currentDocument.category), 'category').to.equal(reassignments.category);
      } else {
        expect(getCategoryId(originalDocument.category), 'category').to.equal(getCategoryId(currentDocument.category));
      }

      if (reassignments.product) {
        expect(getProductId(currentDocument.inventory.product), 'product').to.equal(reassignments.product);
      } else {
        expect(getProductId(originalDocument.inventory?.product), 'category').to.equal(getProductId(currentDocument.inventory?.product));
      }
    });
};

const validatePartiallyReassignedSplitDocument = (originalDocument: Transaction.SplitDocument, splitIndex: number, reassignments: {
  recipient?: Recipient.Id;
  project?: Project.Id;
  product?: Product.Id;
  category?: Category.Id;
}) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((currentDocument: Transaction.SplitDocument) => {
      compareTransactionDocuments(originalDocument, currentDocument);

      if (reassignments.recipient) {
        expect(getRecipientId(currentDocument.recipient), 'recipient').to.equal(reassignments.recipient);
      } else {
        expect(getRecipientId(originalDocument.recipient), 'recipient').to.equal(getRecipientId(currentDocument.recipient));
      }

      currentDocument.splits.forEach((split, index) => {
        if (reassignments.project && index === splitIndex) {
          expect(getProjectId(split.project), `[${index}].project`).to.equal(reassignments.project);
        } else {
          expect(getProjectId(originalDocument.splits[index].project), `[${index}].project`).to.equal(getProjectId(split.project));
        }

        if (reassignments.category && index === splitIndex) {
          expect(getCategoryId(split.category), `[${index}].category`).to.equal(reassignments.category);
        } else {
          expect(getCategoryId(originalDocument.splits[index].category), `[${index}].category`).to.equal(getCategoryId(split.category));
        }

        if (reassignments.product && index === splitIndex) {
          expect(getProductId(split.inventory.product), `[${index}].inventory.product`).to.equal(reassignments.product);
        } else {
          expect(originalDocument.splits[index].inventory?.quantity, `[${index}].inventory.quantity`).to.equal(split.inventory?.quantity);
          expect(getProductId(originalDocument.splits[index].inventory?.product), `[${index}].inventory.product`).to.equal(getProductId(split.inventory?.product));
        }

        expect(originalDocument.splits[index].invoice?.invoiceNumber, `[${index}].invoice.invoiceNumber`).to.equal(split.invoice?.invoiceNumber);
        expect(originalDocument.splits[index].invoice?.billingEndDate, `[${index}].invoice.billingEndDate`).to.equal(split.invoice?.billingEndDate);
        expect(originalDocument.splits[index].invoice?.billingStartDate, `[${index}].invoice.billingStartDate`).to.equal(split.invoice?.billingStartDate);
      });
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
    getTransactionDocumentById,
    saveTransactionDocument,
    validateTransactionDeleted,
    validatePartiallyUnsetPaymentDocument,
    validatePartiallyUnsetSplitDocument,
    validatePartiallyReassignedPaymentDocument,
    validatePartiallyReassignedSplitDocument,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateTransactionDeleted: CommandFunction<typeof validateTransactionDeleted>;
      validatePartiallyUnsetPaymentDocument: CommandFunction<typeof validatePartiallyUnsetPaymentDocument>;
      validatePartiallyUnsetSplitDocument: CommandFunction<typeof validatePartiallyUnsetSplitDocument>;
      validatePartiallyReassignedPaymentDocument: CommandFunction<typeof validatePartiallyReassignedPaymentDocument>;
      validatePartiallyReassignedSplitDocument: CommandFunction<typeof validatePartiallyReassignedSplitDocument>;
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
