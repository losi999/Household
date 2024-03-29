import { Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';

type RelatedDocument = 'category' | 'project' | 'recipient' | 'inventory' | 'invoice';

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

      if (document.category?.categoryType === 'inventory' && document.inventory) {
        expect(document.inventory.quantity, 'inventory.quantity').to.equal(request.inventory.quantity);
        expect(getProductId(document.inventory.product), 'inventory.productId').to.equal(request.inventory.productId);
      } else {
        expect(document.inventory, 'inventory').to.be.undefined;
      }

      if (document.category?.categoryType === 'invoice' && document.invoice) {
        expect(document.invoice.invoiceNumber, 'invoice.invoiceNumber').to.equal(request.invoice.invoiceNumber);
        expect(new Date(document.invoice.billingStartDate).toISOString(), 'invoice.billingStartDate').to.equal(new Date(request.invoice.billingStartDate).toISOString());
        expect(new Date(document.invoice.billingEndDate).toISOString(), 'invoice.billingEndDate').to.equal(new Date(request.invoice.billingEndDate).toISOString());
      } else {
        expect(document.invoice, 'invoice').to.be.undefined;
      }
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
        expect(split.amount, `splits[${index}].amount`).to.equal(request.splits[index].amount);
        expect(split.description, `splits[${index}].description`).to.equal(request.splits[index].description);
        expect(getProjectId(split.project), `splits[${index}].project`).to.equal(request.splits[index].projectId);
        expect(getCategoryId(split.category), `splits[${index}].category`).to.equal(request.splits[index].categoryId);

        if (split.category?.categoryType === 'inventory' && split.inventory) {
          expect(split.inventory.quantity, `splits[${index}].inventory.quantity`).to.equal(request.splits[index].inventory.quantity);
          expect(getProductId(split.inventory.product), `splits[${index}].inventory.productId`).to.equal(request.splits[index].inventory.productId);
        } else {
          expect(split.inventory, `splits[${index}].inventory`).to.be.undefined;
        }

        if (split.category?.categoryType === 'invoice' && split.invoice) {
          expect(split.invoice.invoiceNumber, `splits[${index}].invoice.invoiceNumber`).to.equal(request.splits[index].invoice.invoiceNumber);
          expect(new Date(split.invoice.billingStartDate).toISOString(), `splits[${index}].invoice.billingStartDate`).to.equal(new Date(request.splits[index].invoice.billingStartDate).toISOString());
          expect(new Date(split.invoice.billingEndDate).toISOString(), `splits[${index}].invoice.billingEndDate`).to.equal(new Date(request.splits[index].invoice.billingEndDate).toISOString());
        } else {
          expect(split.invoice, `splits[${index}].invoice`).to.be.undefined;
        }
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

  if (response.category?.categoryType === 'inventory') {
    expect(response.inventory?.quantity, 'inventory.quantity').to.equal(document.inventory?.quantity);
    expect(response.inventory?.product.productId, 'inventory.product.productId').to.equal(getProductId(document.inventory?.product));
    expect(response.inventory?.product.brand, 'inventory.product.brand').to.equal(document.inventory?.product.brand);
    expect(response.inventory?.product.measurement, 'inventory.product.measurement').to.equal(document.inventory?.product.measurement);
    expect(response.inventory?.product.unitOfMeasurement, 'inventory.product.unitOfMeasurement').to.equal(document.inventory?.product.unitOfMeasurement);
  } else {
    expect(response.inventory, 'inventory').to.be.undefined;
  }

  if (response.category?.categoryType === 'invoice') {
    expect(response.invoice?.invoiceNumber, 'invoice.invoiceNumber').to.equal(document.invoice?.invoiceNumber);
    expect(new Date(response.invoice?.billingStartDate).toISOString(), 'invoice.billingStartDate').to.equal(new Date(document.invoice?.billingStartDate).toISOString());
    expect(new Date(response.invoice?.billingEndDate).toISOString(), 'invoice.billingEndDate').to.equal(new Date(document.invoice?.billingEndDate).toISOString());
  } else {
    expect(response.invoice, 'invoice').to.be.undefined;
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
    expect(split.project?.projectId, `splits[${index}].project.projectId`).to.equal(getProjectId(document.splits[index].project));
    expect(split.project?.name, `splits[${index}].project.name`).to.equal(document.splits[index].project?.name);
    expect(split.project?.description, `splits[${index}].project.description`).to.equal(document.splits[index].project?.description);

    expect(split.category?.categoryId, `splits[${index}].category.categoryId`).to.equal(getCategoryId(document.splits[index].category));
    expect(split.category?.categoryType, `splits[${index}].category.categoryType`).to.equal(document.splits[index].category?.categoryType);
    expect(split.category?.fullName, `splits[${index}].category.fullName`).to.equal(document.splits[index].category?.fullName);
    expect(split.category?.name, `splits[${index}].category.name`).to.equal(document.splits[index].category?.name);

    if(split.category?.categoryType === 'inventory') {
      expect(split.inventory?.quantity, `splits[${index}].inventory.quantity`).to.equal(document.splits[index].inventory?.quantity);
      expect(split.inventory?.product.productId, `splits[${index}].inventory.product.productId`).to.equal(getProductId(document.splits[index].inventory?.product));
      expect(split.inventory?.product.brand, `splits[${index}].inventory.product.brand`).to.equal(document.splits[index].inventory?.product.brand);
      expect(split.inventory?.product.measurement, `splits[${index}].inventory.product.measurement`).to.equal(document.splits[index].inventory?.product.measurement);
      expect(split.inventory?.product.unitOfMeasurement, `splits[${index}].inventory.product.unitOfMeasurement`).to.equal(document.splits[index].inventory?.product.unitOfMeasurement);
    } else {
      expect(split.inventory, `splits[${index}].inventory`).to.be.undefined;
    }

    if(split.category?.categoryType === 'invoice') {
      expect(split.invoice?.invoiceNumber, `splits[${index}].invoice.invoiceNumber`).to.equal(document.splits[index].invoice?.invoiceNumber);
      expect(new Date(split.invoice?.billingStartDate).toISOString(), `isplits[${index}].nvoice.billingStartDate`).to.equal(new Date(document.splits[index].invoice?.billingStartDate).toISOString());
      expect(new Date(split.invoice?.billingEndDate).toISOString(), `splits[${index}].invoice.billingEndDate`).to.equal(new Date(document.splits[index].invoice?.billingEndDate).toISOString());
    } else {
      expect(split.invoice, `splits[${index}].invoice`).to.be.undefined;
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
  expect(getTransactionId(current), 'id').to.equal(getTransactionId(original));
  expect(current.amount, 'amount').to.equal(original.amount);
  expect(new Date(current.issuedAt).toISOString(), 'issuedAt').to.equal(new Date(original.issuedAt).toISOString());
  expect(current.transactionType, 'transactionType').to.equal(original.transactionType);
  expect(current.description, 'description').to.equal(original.description);
  expect(getAccountId(current.account), 'account').to.equal(getAccountId(original.account));
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
        expect(getRecipientId(currentDocument.recipient), 'recipient').to.equal(getRecipientId(originalDocument.recipient));
      }

      if (relatedDocumentToUnset?.includes('project')) {
        expect(currentDocument.project, 'project').to.be.undefined;
      } else {
        expect(getProjectId(currentDocument.project), 'project').to.equal(getProjectId(originalDocument.project));
      }

      if (relatedDocumentToUnset?.includes('category')) {
        expect(currentDocument.category, 'category').to.be.undefined;
      } else {
        expect(getCategoryId(currentDocument.category), 'category').to.equal(getCategoryId(originalDocument.category));
      }

      if (relatedDocumentToUnset?.includes('inventory')) {
        expect(currentDocument.inventory, 'inventory').to.be.undefined;
      } else {
        expect(currentDocument.inventory?.quantity, 'inventory.quantity').to.equal(originalDocument.inventory?.quantity);
        expect(getProductId(currentDocument.inventory?.product), 'inventory.product').to.equal(getProductId(originalDocument.inventory?.product));
      }

      if (relatedDocumentToUnset?.includes('invoice')) {
        expect(currentDocument.invoice, 'invoice').to.be.undefined;
      } else {
        expect(currentDocument.invoice?.invoiceNumber, 'invoice.invoiceNumber').to.equal(originalDocument.invoice?.invoiceNumber);
        expect(currentDocument.invoice?.billingEndDate, 'invoice.billingEndDate').to.equal(originalDocument.invoice?.billingEndDate);
        expect(currentDocument.invoice?.billingStartDate, 'invoice.billingStartDate').to.equal(originalDocument.invoice?.billingStartDate);
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
        expect(getRecipientId(currentDocument.recipient), 'recipient').to.equal(getRecipientId(originalDocument.recipient));
      }

      currentDocument.splits.forEach((split, index) => {
        if (relatedDocumentToUnset?.includes('project') && index === splitIndex) {
          expect(split.project, `splits.[${index}].project`).to.be.undefined;
        } else {
          expect(getProjectId(split.project), `splits.[${index}].project`).to.equal(getProjectId(originalDocument.splits[index].project));
        }

        if (relatedDocumentToUnset?.includes('category') && index === splitIndex) {
          expect(split.category, `splits.[${index}].category`).to.be.undefined;
        } else {
          expect(getCategoryId(split.category), `splits.[${index}].category`).to.equal(getCategoryId(originalDocument.splits[index].category));
        }

        if (relatedDocumentToUnset?.includes('inventory') && index === splitIndex) {
          expect(split.inventory, `splits.[${index}].inventory`).to.be.undefined;
        } else {
          expect(split.inventory?.quantity, `splits.[${index}].inventory.quantity`).to.equal(originalDocument.splits[index].inventory?.quantity);
          expect(getProductId(split.inventory?.product), `splits.[${index}].inventory.product`).to.equal(getProductId(originalDocument.splits[index].inventory?.product));
        }

        if (relatedDocumentToUnset?.includes('invoice') && index === splitIndex) {
          expect(split.invoice, `splits.[${index}].invoice`).to.be.undefined;
        } else {
          expect(split.invoice?.invoiceNumber, `splits.[${index}].invoice.invoiceNumber`).to.equal(originalDocument.splits[index].invoice?.invoiceNumber);
          expect(split.invoice?.billingEndDate, `splits.[${index}].invoice.billingEndDate`).to.equal(originalDocument.splits[index].invoice?.billingEndDate);
          expect(split.invoice?.billingStartDate, `splits.[${index}].invoice.billingStartDate`).to.equal(originalDocument.splits[index].invoice?.billingStartDate);
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
        expect(getRecipientId(currentDocument.recipient), 'recipient').to.equal(getRecipientId(currentDocument.recipient));
      }

      if (reassignments.project) {
        expect(getProjectId(currentDocument.project), 'project').to.equal(reassignments.project);
      } else {
        expect(getProjectId(currentDocument.project), 'project').to.equal(getProjectId(originalDocument.project));
      }

      if (reassignments.category) {
        expect(getCategoryId(currentDocument.category), 'category').to.equal(reassignments.category);
      } else {
        expect(getCategoryId(currentDocument.category), 'category').to.equal(getCategoryId(originalDocument.category));
      }

      if (reassignments.product) {
        expect(getProductId(currentDocument.inventory.product), 'inventory.product').to.equal(reassignments.product);
      } else {
        expect(getProductId(currentDocument.inventory?.product), 'inventory.product').to.equal(getProductId(originalDocument.inventory?.product));
      }
      expect(currentDocument.inventory?.quantity, 'inventory.quantity').to.equal(originalDocument.inventory?.quantity);
      expect(currentDocument.invoice?.invoiceNumber, 'invoice.invoiceNumber').to.equal(originalDocument.invoice?.invoiceNumber);
      expect(currentDocument.invoice?.billingEndDate, 'invoice.billingEndDate').to.equal(originalDocument.invoice?.billingEndDate);
      expect(currentDocument.invoice?.billingStartDate, 'invoice.billingStartDate').to.equal(originalDocument.invoice?.billingStartDate);
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
        expect(getRecipientId(currentDocument.recipient), 'recipient').to.equal(getRecipientId(originalDocument.recipient));
      }

      currentDocument.splits.forEach((split, index) => {
        if (reassignments.project && index === splitIndex) {
          expect(getProjectId(split.project), `splits.[${index}].project`).to.equal(reassignments.project);
        } else {
          expect(getProjectId(split.project), `splits.[${index}].project`).to.equal(getProjectId(originalDocument.splits[index].project));
        }

        if (reassignments.category && index === splitIndex) {
          expect(getCategoryId(split.category), `splits.[${index}].category`).to.equal(reassignments.category);
        } else {
          expect(getCategoryId(split.category), `splits.[${index}].category`).to.equal(getCategoryId(originalDocument.splits[index].category));
        }

        if (reassignments.product && index === splitIndex) {
          expect(getProductId(split.inventory.product), `splits.[${index}].inventory.product`).to.equal(reassignments.product);
        } else {
          expect(getProductId(split.inventory?.product), `splits.[${index}].inventory.product`).to.equal(getProductId(originalDocument.splits[index].inventory?.product));
        }
        expect(split.inventory?.quantity, `splits.[${index}].inventory.quantity`).to.equal(originalDocument.splits[index].inventory?.quantity);

        expect(split.invoice?.invoiceNumber, `splits.[${index}].invoice.invoiceNumber`).to.equal(originalDocument.splits[index].invoice?.invoiceNumber);
        expect(split.invoice?.billingEndDate, `splits.[${index}].invoice.billingEndDate`).to.equal(originalDocument.splits[index].invoice?.billingEndDate);
        expect(split.invoice?.billingStartDate, `splits.[${index}].invoice.billingStartDate`).to.equal(originalDocument.splits[index].invoice?.billingStartDate);
      });
    });
};

export const setTransactionValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateTransactionPaymentDocument,
    validateTransactionTransferDocument,
    validateTransactionSplitDocument,
    validateTransactionPaymentResponse,
    validateTransactionTransferResponse,
    validateTransactionSplitResponse,
    validateTransactionListResponse,
  });

  Cypress.Commands.addAll({
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
