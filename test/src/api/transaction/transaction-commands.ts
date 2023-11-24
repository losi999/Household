import { Account, Category, Common, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { headerExpiresIn } from '@household/shared/constants';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { ITransactionService } from '@household/shared/services/transaction-service';
import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';

type RelatedDocumentOperation = 'categoryReassign' | 'productReassign' | 'categoryUnset' | 'inventoryUnset' | 'projectUnset' | 'recipientUnset' | 'projectReassign' | 'recipientReassign';

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

const requestGetTransactionListByAccount = (idToken: string, accountId: Account.Id, querystring?: Common.Pagination<number>) => {
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

const validateInventoryDocument = (request: Transaction.InventoryRequest, document: Transaction.Inventory<Product.Document>, categoryId: Category.Id, productId: Product.Id) => {
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

const validateInvoiceDocument = (request: Transaction.Invoice<string>, document: Transaction.Invoice<Date>, categoryId: Category.Id) => {
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

      validateInventoryDocument(request, document, getCategoryId(document.category), getProductId(document.inventory?.product));
      validateInvoiceDocument(request, document, getCategoryId(document.category));
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

        validateInventoryDocument(request.splits[index], split, getCategoryId(split.category), getProductId(split.inventory?.product));
        validateInvoiceDocument(request.splits[index], split, getCategoryId(split.category));
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

const compareTransactionPaymentDocuments = (original: Transaction.PaymentDocument, updated: Transaction.PaymentDocument, operation: RelatedDocumentOperation) => {
  expect(original.invoice, 'invoice').to.equal(updated.invoice);

  if (operation !== 'recipientUnset' && operation !== 'recipientReassign') {
    expect(getRecipientId(original.recipient), 'recipient').to.equal(getRecipientId(updated.recipient));
  }

  if (operation !== 'projectUnset' && operation !== 'projectReassign') {
    expect(getProjectId(original.project), 'project').to.equal(getProjectId(updated.project));
  }

  if (operation !== 'categoryReassign' && operation !== 'categoryUnset') {
    expect(getCategoryId(original.category), 'category').to.equal(getCategoryId(updated.category));
  }

  if (operation !== 'inventoryUnset') {
    expect(original.inventory?.quantity, 'inventory.quantity').to.equal(updated.inventory?.quantity);
    if (operation !== 'productReassign') {
      expect(getProductId(original.inventory?.product), 'inventory.product').to.equal(getProductId(updated.inventory?.product));
    }
  }
};

const compareTransactionSplitDocuments = (original: Transaction.SplitDocument, updated: Transaction.SplitDocument, operation: RelatedDocumentOperation, splitIndex: number) => {
  if (operation !== 'recipientUnset' && operation !== 'recipientReassign') {
    expect(getRecipientId(original.recipient), 'recipient').to.equal(getRecipientId(updated.recipient));
  }

  original.splits.forEach((split, index) => {
    expect(split.invoice, `splits[${index}].invoice`).to.equal(updated.splits[index].invoice);

    if ((operation !== 'projectUnset' && operation !== 'projectReassign') || index !== splitIndex) {
      expect(getProjectId(split.project), `splits[${index}].project`).to.equal(getProjectId(updated.splits[index].project));
    }

    if (operation !== 'categoryReassign' && operation !== 'categoryUnset' || index !== splitIndex) {
      expect(getCategoryId(split.category), `splits[${index}].category`).to.equal(getCategoryId(updated.splits[index].category));
    }

    if (operation !== 'inventoryUnset' || index !== splitIndex) {
      expect(split.inventory?.quantity, `splits[${index}].inventory.quantity`).to.equal(updated.splits[index].inventory?.quantity);
      if (operation !== 'productReassign' || index !== splitIndex) {
        expect(getProductId(split.inventory?.product), `splits[${index}].inventory.product`).to.equal(getProductId(updated.splits[index].inventory?.product));
      }
    }
  });
};

const compareTransactionTransferDocuments = (original: Transaction.TransferDocument, updated: Transaction.TransferDocument) => {
  expect(getAccountId(original.transferAccount), 'transferAccount').to.equal(getAccountId(updated.transferAccount));
};

const compareTransactionDocuments = (original: Transaction.Document, updated: Transaction.Document, operation: RelatedDocumentOperation, splitIndex?: number) => {
  expect(getTransactionId(original), 'id').to.equal(getTransactionId(updated));
  expect(original.amount, 'amount').to.equal(updated.amount);
  expect(new Date(original.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(updated.issuedAt).toISOString());
  expect(original.transactionType, 'transactionType').to.equal(updated.transactionType);
  expect(original.description, 'description').to.equal(updated.description);
  expect(getAccountId(original.account), 'account').to.equal(getAccountId(updated.account));
  if (original.transactionType === 'payment' && updated.transactionType === 'payment') {
    compareTransactionPaymentDocuments(original, updated, operation);
  }

  if (original.transactionType === 'split' && updated.transactionType === 'split') {
    compareTransactionSplitDocuments(original, updated, operation, splitIndex);
  }

  if (original.transactionType === 'transfer' && updated.transactionType === 'transfer') {
    compareTransactionTransferDocuments(original, updated);
  }
};

const validateRecipientUnset = (originalDocument: Transaction.PaymentDocument | Transaction.SplitDocument) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((document: Transaction.Document) => {
      compareTransactionDocuments(originalDocument, document, 'recipientUnset');
      if (document.transactionType !== 'transfer') {
        expect(document.recipient, 'recipient').to.be.undefined;
      }
    });
};

const validateProjectUnset = (originalDocument: Transaction.PaymentDocument | Transaction.SplitDocument, splitIndex?: number) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((document: Transaction.Document) => {
      compareTransactionDocuments(originalDocument, document, 'projectUnset', splitIndex);
      switch(document.transactionType) {
        case 'payment': {
          expect(document.project, 'project').to.be.undefined;
          break;
        }
        case 'split': {
          expect(document.splits[splitIndex].project, `splits[${splitIndex}].project`).to.be.undefined;
          break;
        }
      }
    });
};

const validateInventoryUnset = (originalDocument: Transaction.PaymentDocument | Transaction.SplitDocument, splitIndex?: number) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((document: Transaction.Document) => {
      compareTransactionDocuments(originalDocument, document, 'inventoryUnset', splitIndex);
      switch(document.transactionType) {
        case 'payment': {
          expect(document.inventory, 'inventory').to.be.undefined;
          break;
        }
        case 'split': {
          expect(document.splits[splitIndex].inventory, `splits[${splitIndex}].inventory`).to.be.undefined;
          break;
        }
      }
    });
};

const validateCategoryUnset = (originalDocument: Transaction.PaymentDocument | Transaction.SplitDocument, splitIndex?: number) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((document: Transaction.Document) => {
      compareTransactionDocuments(originalDocument, document, 'categoryUnset', splitIndex);
      switch(document.transactionType) {
        case 'payment': {
          expect(document.category, 'category').to.be.undefined;
          break;
        }
        case 'split': {
          expect(document.splits[splitIndex].category, `splits[${splitIndex}].category`).to.be.undefined;
          break;
        }
      }
    });
};

const validateCategoryReassign = (originalDocument: Transaction.PaymentDocument | Transaction.SplitDocument, newCategoryId: Category.Id, splitIndex?: number) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((document: Transaction.Document) => {
      compareTransactionDocuments(originalDocument, document, 'categoryReassign', splitIndex);
      switch(document.transactionType) {
        case 'payment': {
          expect(getCategoryId(document.category), 'category').to.equal(newCategoryId);
          break;
        }
        case 'split': {
          expect(getCategoryId(document.splits[splitIndex].category), `splits[${splitIndex}].category`).to.equal(newCategoryId);
          break;
        }
      }
    });
};

const validateProjectReassign = (originalDocument: Transaction.PaymentDocument | Transaction.SplitDocument, newProjectId: Project.Id, splitIndex?: number) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((document: Transaction.Document) => {
      compareTransactionDocuments(originalDocument, document, 'projectReassign', splitIndex);
      switch(document.transactionType) {
        case 'payment': {
          expect(getProjectId(document.project), 'project').to.equal(newProjectId);
          break;
        }
        case 'split': {
          expect(getProjectId(document.splits[splitIndex].project), `splits[${splitIndex}].project`).to.equal(newProjectId);
          break;
        }
      }
    });
};

const validateProductReassign = (originalDocument: Transaction.PaymentDocument | Transaction.SplitDocument, newProductId: Product.Id, splitIndex?: number) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((document: Transaction.Document) => {
      compareTransactionDocuments(originalDocument, document, 'productReassign', splitIndex);
      switch(document.transactionType) {
        case 'payment': {
          expect(getProductId(document.inventory.product), 'product').to.equal(newProductId);
          break;
        }
        case 'split': {
          expect(getProductId(document.splits[splitIndex].inventory.product), `splits[${splitIndex}].product`).to.equal(newProductId);
          break;
        }
      }
    });
};

const validateRecipientReassign = (originalDocument: Transaction.PaymentDocument | Transaction.SplitDocument, newRecipientId: Recipient.Id, splitIndex?: number) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((document: Transaction.Document) => {
      compareTransactionDocuments(originalDocument, document, 'recipientReassign', splitIndex);
      if (document.transactionType !== 'transfer') {
        expect(getRecipientId(document.recipient), 'recipient').to.equal(newRecipientId);
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
    validateInventoryUnset,
    validateCategoryUnset,
    validateCategoryReassign,
    validateProductReassign,
    validateProjectReassign,
    validateRecipientUnset,
    validateRecipientReassign,
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
      validateInventoryUnset: CommandFunction<typeof validateInventoryUnset>;
      validateCategoryUnset: CommandFunction<typeof validateCategoryUnset>;
      validateCategoryReassign: CommandFunction<typeof validateCategoryReassign>;
      validateProductReassign: CommandFunction<typeof validateProductReassign>;
      validateProjectReassign: CommandFunction<typeof validateProjectReassign>
      validateRecipientUnset: CommandFunction<typeof validateRecipientUnset>;
      validateRecipientReassign: CommandFunction<typeof validateRecipientReassign>;
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
