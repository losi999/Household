import { Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { createDate, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';

type RelatedDocument = 'category' | 'project' | 'recipient' | 'inventory' | 'invoice';

const validateTransactionPaymentDocument = (response: Transaction.TransactionId, request: Transaction.PaymentRequest) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .getTransactionDocumentById(id)
    .should((document: Transaction.PaymentDocument) => {
      expect(getTransactionId(document), 'id').to.equal(id);
      expect(document.amount, 'amount').to.equal(request.amount);
      expect(document.issuedAt.toISOString(), 'issuedAt').to.equal(createDate(request.issuedAt).toISOString());
      expect(document.transactionType, 'transactionType').to.equal('payment');
      expect(document.description, 'description').to.equal(request.description);
      expect(getAccountId(document.account), 'account').to.equal(request.accountId);
      expect(getCategoryId(document.category), 'category').to.equal(request.categoryId);
      expect(getProjectId(document.project), 'project').to.equal(request.projectId);
      expect(getRecipientId(document.recipient), 'recipient').to.equal(request.recipientId);

      if (document.category?.categoryType === 'inventory') {
        expect(document.quantity, 'quantity').to.equal(request.quantity);
        expect(getProductId(document.product), 'productId').to.equal(request.productId);
      } else {
        expect(document.quantity, 'quantity').to.be.undefined;
        expect(document.product, 'product').to.be.undefined;
      }

      if (document.category?.categoryType === 'invoice') {
        expect(document.invoiceNumber, 'invoiceNumber').to.equal(request.invoiceNumber);
        expect(document.billingStartDate?.toISOString(), 'billingStartDate').to.equal(createDate(request.billingStartDate)?.toISOString());
        expect(document.billingEndDate?.toISOString(), 'billingEndDate').to.equal(createDate(request.billingEndDate)?.toISOString());
      } else {
        expect(document.invoiceNumber, 'invoiceNumber').to.be.undefined;
        expect(document.billingStartDate, 'billingStartDate').to.be.undefined;
        expect(document.billingEndDate, 'billingEndDate').to.be.undefined;
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
      expect(document.issuedAt.toISOString(), 'issuedAt').to.equal(createDate(request.issuedAt).toISOString());
      expect(document.transactionType, 'transactionType').to.equal('split');
      expect(document.description, 'description').to.equal(request.description);
      expect(getAccountId(document.account), 'account').to.equal(request.accountId);
      expect(getRecipientId(document.recipient), 'recipient').to.equal(request.recipientId);

      document.splits.forEach((split, index) => {
        expect(split.amount, `splits[${index}].amount`).to.equal(request.splits[index].amount);
        expect(split.description, `splits[${index}].description`).to.equal(request.splits[index].description);
        expect(getProjectId(split.project), `splits[${index}].project`).to.equal(request.splits[index].projectId);
        expect(getCategoryId(split.category), `splits[${index}].category`).to.equal(request.splits[index].categoryId);

        if (split.category?.categoryType === 'inventory') {
          expect(split.quantity, `splits[${index}].quantity`).to.equal(request.splits[index].quantity);
          expect(getProductId(split.product), `splits[${index}].productId`).to.equal(request.splits[index].productId);
        } else {
          expect(split.quantity, `splits[${index}].quantity`).to.be.undefined;
          expect(split.product, `splits[${index}].product`).to.be.undefined;
        }

        if (split.category?.categoryType === 'invoice') {
          expect(split.invoiceNumber, `splits[${index}].invoiceNumber`).to.equal(request.splits[index].invoiceNumber);
          expect(split.billingStartDate?.toISOString(), `splits[${index}].billingStartDate`).to.equal(createDate(request.splits[index].billingStartDate)?.toISOString());
          expect(split.billingEndDate?.toISOString(), `splits[${index}].billingEndDate`).to.equal(createDate(request.splits[index].billingEndDate)?.toISOString());
        } else {
          expect(split.invoiceNumber, `splits[${index}].invoiceNumber`).to.be.undefined;
          expect(split.billingStartDate, `splits[${index}].billingStartDate`).to.be.undefined;
          expect(split.billingEndDate, `splits[${index}].billingEndDate`).to.be.undefined;
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
      expect(document.issuedAt.toISOString(), 'issuedAt').to.equal(createDate(request.issuedAt).toISOString());
      expect(document.transactionType, 'transactionType').to.equal('transfer');
      expect(document.description, 'description').to.equal(request.description);
      expect(document.transferAmount, 'transferAmount').to.equal(request.transferAmount ?? request.amount * -1);
      expect(getAccountId(document.account), 'account').to.equal(request.accountId);
      expect(getAccountId(document.transferAccount), 'transferAccount').to.equal(request.transferAccountId);
    });
};

const validateTransactionPaymentResponse = (response: Transaction.PaymentResponse, document: Transaction.PaymentDocument) => {
  expect(response.transactionId).to.equal(getTransactionId(document));
  expect(response.amount, 'amount').to.equal(document.amount);
  expect(createDate(response.issuedAt).toISOString(), 'issuedAt').to.equal(document.issuedAt.toISOString());
  expect(response.transactionType, 'transactionType').to.equal('payment');
  expect(response.description, 'description').to.equal(document.description);
  expect(response.account.accountId, 'account.accountId').to.equal(getAccountId(document.account));
  expect(response.account.accountType, 'account.accountType').to.equal(document.account.accountType);
  expect(response.account.balance, 'account.balance').to.equal(document.account.balance ?? null);
  expect(response.account.currency, 'account.currency').to.equal(document.account.currency);
  expect(response.account.isOpen, 'account.isOpen').to.equal(document.account.isOpen);
  expect(response.account.name, 'account.name').to.equal(document.account.name);
  expect(response.account.fullName, 'account.fullName').to.equal(`${document.account.name} (${document.account.owner})`);

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
    expect(response.quantity, 'quantity').to.equal(document.quantity);
    expect(response.product?.productId, 'product.productId').to.equal(getProductId(document.product));
    expect(response.product?.brand, 'product.brand').to.equal(document.product?.brand);
    expect(response.product?.measurement, 'product.measurement').to.equal(document.product?.measurement);
    expect(response.product?.unitOfMeasurement, 'product.unitOfMeasurement').to.equal(document.product?.unitOfMeasurement);
  } else {
    expect(response.quantity, 'quantity').to.be.undefined;
    expect(response.product, 'product').to.be.undefined;
  }

  if (response.category?.categoryType === 'invoice') {
    expect(response.invoiceNumber, 'invoiceNumber').to.equal(document.invoiceNumber);
    expect(createDate(response.billingStartDate)?.toISOString(), 'billingStartDate').to.equal(document.billingStartDate?.toISOString());
    expect(createDate(response.billingEndDate)?.toISOString(), 'billingEndDate').to.equal(document.billingEndDate?.toISOString());
  } else {
    expect(response.invoiceNumber, 'invoiceNumber').to.be.undefined;
    expect(response.billingStartDate, 'billingStartDate').to.be.undefined;
    expect(response.billingEndDate, 'billingEndDate').to.be.undefined;
  }
};

const validateTransactionTransferResponse = (response: Transaction.TransferResponse, document: Transaction.TransferDocument) => {
  expect(response.transactionId).to.equal(getTransactionId(document));
  expect(response.amount, 'amount').to.equal(document.amount);
  expect(createDate(response.issuedAt).toISOString(), 'issuedAt').to.equal(document.issuedAt.toISOString());
  expect(response.transactionType, 'transactionType').to.equal('transfer');
  expect(response.description, 'description').to.equal(document.description);
  expect(response.account.accountId, 'account.accountId').to.equal(getAccountId(document.account));
  expect(response.account.accountType, 'account.accountType').to.equal(document.account.accountType);
  expect(response.account.balance, 'account.balance').to.equal(document.account.balance ?? null);
  expect(response.account.currency, 'account.currency').to.equal(document.account.currency);
  expect(response.account.isOpen, 'account.isOpen').to.equal(document.account.isOpen);
  expect(response.account.name, 'account.name').to.equal(document.account.name);
  expect(response.account.fullName, 'account.fullName').to.equal(`${document.account.name} (${document.account.owner})`);
  expect(response.transferAccount.accountId, 'transferAccount.accountId').to.equal(getAccountId(document.transferAccount));
  expect(response.transferAccount.accountType, 'transferAccount.accountType').to.equal(document.transferAccount.accountType);
  expect(response.transferAccount.balance, 'transferAccount.balance').to.equal(document.transferAccount.balance ?? null);
  expect(response.transferAccount.currency, 'transferAccount.currency').to.equal(document.transferAccount.currency);
  expect(response.transferAccount.isOpen, 'transferAccount.isOpen').to.equal(document.transferAccount.isOpen);
  expect(response.transferAccount.name, 'transferAccount.name').to.equal(document.transferAccount.name);
  expect(response.transferAccount.fullName, 'transferAccount.fullName').to.equal(`${document.transferAccount.name} (${document.transferAccount.owner})`);

};

const validateTransactionSplitResponse = (response: Transaction.SplitResponse, document: Transaction.SplitDocument) => {
  expect(response.transactionId).to.equal(getTransactionId(document));
  expect(response.amount, 'amount').to.equal(document.amount);
  expect(createDate(response.issuedAt).toISOString(), 'issuedAt').to.equal(document.issuedAt.toISOString());
  expect(response.transactionType, 'transactionType').to.equal('split');
  expect(response.description, 'description').to.equal(document.description);
  expect(response.account.accountId, 'account.accountId').to.equal(getAccountId(document.account));
  expect(response.account.accountType, 'account.accountType').to.equal(document.account.accountType);
  expect(response.account.balance, 'account.balance').to.equal(document.account.balance ?? null);
  expect(response.account.currency, 'account.currency').to.equal(document.account.currency);
  expect(response.account.isOpen, 'account.isOpen').to.equal(document.account.isOpen);
  expect(response.account.name, 'account.name').to.equal(document.account.name);
  expect(response.account.fullName, 'account.fullName').to.equal(`${document.account.name} (${document.account.owner})`);

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
      expect(split.quantity, `splits[${index}].quantity`).to.equal(document.splits[index].quantity);
      expect(split.product?.productId, `splits[${index}].product.productId`).to.equal(getProductId(document.splits[index].product));
      expect(split.product?.brand, `splits[${index}].product.brand`).to.equal(document.splits[index].product?.brand);
      expect(split.product?.measurement, `splits[${index}].product.measurement`).to.equal(document.splits[index].product?.measurement);
      expect(split.product?.unitOfMeasurement, `splits[${index}].product.unitOfMeasurement`).to.equal(document.splits[index].product?.unitOfMeasurement);
    } else {
      expect(split.quantity, `splits[${index}].quantity`).to.be.undefined;
      expect(split.product, `splits[${index}].product`).to.be.undefined;
    }

    if(split.category?.categoryType === 'invoice') {
      expect(split.invoiceNumber, `splits[${index}].invoiceNumber`).to.equal(document.splits[index].invoiceNumber);
      expect(createDate(split.billingStartDate)?.toISOString(), `isplits[${index}].billingStartDate`).to.equal(document.splits[index].billingStartDate?.toISOString());
      expect(createDate(split.billingEndDate)?.toISOString(), `splits[${index}].billingEndDate`).to.equal(document.splits[index].billingEndDate?.toISOString());
    } else {
      expect(split.invoiceNumber, `splits[${index}].invoiceNumber`).to.be.undefined;
      expect(split.billingStartDate, `isplits[${index}].billingStartDate`).to.be.undefined;
      expect(split.billingEndDate, `splits[${index}].billingEndDate`).to.be.undefined;
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

const validateTransactionListReport = (reports: Transaction.Report[], payments: Transaction.PaymentDocument[], splits: [Transaction.SplitDocument, number[]][]) => {
  const total = payments.length + splits.reduce((accumulator, currentValue) => {
    return accumulator + currentValue[1].length;
  }, 0);
  expect(reports.length, 'number of items').to.equal(total);
  payments.forEach((document) => {
    const items = reports.filter(r => r.transactionId === getTransactionId(document));

    expect(items.length, `number of reports for transaction ${getTransactionId(document)}`).to.equal(1);
    const [report] = items;
    expect(report.transactionId, 'id').to.equal(getTransactionId(document));
    expect(report.amount, 'amount').to.equal(document.amount);
    expect(report.description, 'description').to.equal(document.description);
    expect(report.issuedAt, 'issuedAt').to.equal(document.issuedAt.toISOString());
    expect(report.account.accountId, 'account.accountId').to.equal(getAccountId(document.account));
    expect(report.account.currency, 'account.currency').to.equal(document.account.currency);
    expect(report.account.fullName, 'account.name').to.equal(`${document.account.name} (${document.account.owner})`);

    expect(report.project?.projectId, 'project.projectId').to.equal(getProjectId(document.project));
    expect(report.project?.name, 'project.name').to.equal(document.project?.name);

    expect(report.recipient?.recipientId, 'recipient.recipientId').to.equal(getRecipientId(document.recipient));
    expect(report.recipient?.name, 'recipient.name').to.equal(document.recipient?.name);

    expect(report.category?.categoryId, 'category.categoryId').to.equal(getCategoryId(document.category));
    expect(report.category?.fullName, 'category.fullName').to.equal(document.category?.fullName);

    expect(report.product?.quantity, 'product.quantity').to.equal(document.quantity);
    expect(report.product?.productId, 'product.productId').to.equal(getProductId(document.product));
    expect(report.product?.fullName, 'product.fullName').to.equal(document.product?.fullName);
  });

  splits.forEach(([
    document,
    indices,
  ]) => {
    const items = reports.filter(r => r.transactionId === getTransactionId(document));

    expect(items.length, `number of reports for transaction ${getTransactionId(document)}`).to.equal(indices.length);
    const splits = indices.reduce<Transaction.SplitDocumentItem<Date>[]>((accumulator, currentValue) => {
      return [
        ...accumulator,
        document.splits[currentValue],
      ];
    }, []);
    items.forEach((report) => {
      expect(report.transactionId, 'id').to.equal(getTransactionId(document));
      expect(report.amount, 'amount').to.be.oneOf(splits.map(s => s.amount));
      expect(report.description, 'description').to.equal(document.description);
      expect(report.issuedAt, 'issuedAt').to.equal(document.issuedAt.toISOString());

      expect(report.account.accountId, 'account.accountId').to.equal(getAccountId(document.account));
      expect(report.account.currency, 'account.currency').to.equal(document.account.currency);
      expect(report.account.fullName, 'account.name').to.equal(`${document.account.name} (${document.account.owner})`);

      expect(report.project?.projectId, 'project.projectId').to.be.oneOf(splits.map(s => getProjectId(s.project)));
      expect(report.project?.name, 'project.name').to.be.oneOf(splits.map(s => s.project?.name));

      expect(report.recipient?.recipientId, 'recipient.recipientId').to.equal(getRecipientId(document.recipient));
      expect(report.recipient?.name, 'recipient.name').to.equal(document.recipient?.name);

      expect(report.category?.categoryId, 'category.categoryId').to.be.oneOf(splits.map(s => getCategoryId(s.category)));
      expect(report.category?.fullName, 'category.fullName').to.be.oneOf(splits.map(s => s.category?.fullName));

      expect(report.product?.quantity, 'product.quantity').to.be.oneOf(splits.map(s => s.quantity));
      expect(report.product?.productId, 'product.productId').to.be.oneOf(splits.map(s => getProductId(s.product)));
      expect(report.product?.fullName, 'product.fullName').to.be.oneOf(splits.map(s => s.product?.fullName));
    });
  });
};

const validateTransactionDeleted = (transactionId: Transaction.Id) => {
  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((document) => {
      expect(document).to.be.null;
    });
};

const compareTransactionDocuments = (original: Transaction.PaymentDocument | Transaction.TransferDocument | Transaction.SplitDocument, current: Transaction.PaymentDocument | Transaction.TransferDocument | Transaction.SplitDocument) => {
  expect(getTransactionId(current), 'id').to.equal(getTransactionId(original));
  expect(current.amount, 'amount').to.equal(original.amount);
  expect(current.issuedAt.toISOString(), 'issuedAt').to.equal(original.issuedAt.toISOString());
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
        expect(currentDocument.quantity, 'quantity').to.be.undefined;
        expect(currentDocument.product, 'product').to.be.undefined;
      } else {
        expect(currentDocument.quantity, 'quantity').to.equal(originalDocument.quantity);
        expect(getProductId(currentDocument.product), 'product').to.equal(getProductId(originalDocument.product));
      }

      if (relatedDocumentToUnset?.includes('invoice')) {
        expect(currentDocument.invoiceNumber, 'invoiceNumber').to.be.undefined;
        expect(currentDocument.billingEndDate, 'billingEndDate').to.be.undefined;
        expect(currentDocument.billingStartDate, 'billingStartDate').to.be.undefined;
      } else {
        expect(currentDocument.invoiceNumber, 'invoiceNumber').to.equal(originalDocument.invoiceNumber);
        expect(currentDocument.billingEndDate?.toISOString(), 'billingEndDate').to.equal(originalDocument.billingEndDate?.toISOString());
        expect(currentDocument.billingStartDate?.toISOString(), 'billingStartDate').to.equal(originalDocument.billingStartDate?.toISOString());
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
          expect(split.quantity, `splits.[${index}].quantity`).to.be.undefined;
          expect(split.product, `splits.[${index}].product`).to.be.undefined;
        } else {
          expect(split.quantity, `splits.[${index}].quantity`).to.equal(originalDocument.splits[index].quantity);
          expect(getProductId(split.product), `splits.[${index}].product`).to.equal(getProductId(originalDocument.splits[index].product));
        }

        if (relatedDocumentToUnset?.includes('invoice') && index === splitIndex) {
          expect(split.invoiceNumber, `splits.[${index}].invoiceNumber`).to.be.undefined;
          expect(split.billingEndDate, `splits.[${index}].billingEndDate`).to.be.undefined;
          expect(split.billingStartDate, `splits.[${index}].billingStartDate`).to.be.undefined;
        } else {
          expect(split.invoiceNumber, `splits.[${index}].invoiceNumber`).to.equal(originalDocument.splits[index].invoiceNumber);
          expect(split.billingEndDate?.toISOString(), `splits.[${index}].billingEndDate`).to.equal(originalDocument.splits[index].billingEndDate?.toISOString);
          expect(split.billingStartDate?.toISOString, `splits.[${index}].billingStartDate`).to.equal(originalDocument.splits[index].billingStartDate?.toISOString);
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
        expect(getProductId(currentDocument.product), 'product').to.equal(reassignments.product);
      } else {
        expect(getProductId(currentDocument.product), 'product').to.equal(getProductId(originalDocument.product));
      }
      expect(currentDocument.quantity, 'quantity').to.equal(originalDocument.quantity);
      expect(currentDocument.invoiceNumber, 'invoiceNumber').to.equal(originalDocument.invoiceNumber);
      expect(currentDocument.billingEndDate?.toISOString, 'billingEndDate').to.equal(originalDocument.billingEndDate?.toISOString);
      expect(currentDocument.billingStartDate?.toISOString, 'billingStartDate').to.equal(originalDocument.billingStartDate?.toISOString);
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
          expect(getProductId(split.product), `splits.[${index}].product`).to.equal(reassignments.product);
        } else {
          expect(getProductId(split.product), `splits.[${index}].product`).to.equal(getProductId(originalDocument.splits[index].product));
        }
        expect(split.quantity, `splits.[${index}].quantity`).to.equal(originalDocument.splits[index].quantity);

        expect(split.invoiceNumber, `splits.[${index}].invoiceNumber`).to.equal(originalDocument.splits[index].invoiceNumber);
        expect(split.billingEndDate?.toISOString, `splits.[${index}].billingEndDate`).to.equal(originalDocument.splits[index].billingEndDate?.toISOString);
        expect(split.billingStartDate?.toISOString, `splits.[${index}].billingStartDate`).to.equal(originalDocument.splits[index].billingStartDate?.toISOString);
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
    validateTransactionListReport,
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
      validateTransactionListReport: CommandFunctionWithPreviousSubject<typeof validateTransactionListReport>;
    }
  }
}
