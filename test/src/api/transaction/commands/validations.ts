import { Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { createDate, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { internalPropertyNames } from '@household/test/api/constants';

type Reassignment<T> = {
  from: T;
  to?: T;
};

const validateTransactionPaymentDocument = (response: Transaction.TransactionId, request: Transaction.PaymentRequest) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .getTransactionDocumentById(id)
    .should((document: Transaction.PaymentDocument) => {
      expect(getTransactionId(document), 'id').to.equal(id);
      const { amount, issuedAt, transactionType, description, account, category, project, recipient, quantity, product, invoiceNumber, billingEndDate, billingStartDate, ...internal } = document;
      expect(amount, 'amount').to.equal(request.amount);
      expect(issuedAt.toISOString(), 'issuedAt').to.equal(createDate(request.issuedAt).toISOString());
      expect(transactionType, 'transactionType').to.equal('payment');
      expect(description, 'description').to.equal(request.description);
      expect(getAccountId(account), 'account').to.equal(request.accountId);
      expect(getCategoryId(category), 'category').to.equal(request.categoryId);
      expect(getProjectId(project), 'project').to.equal(request.projectId);
      expect(getRecipientId(recipient), 'recipient').to.equal(request.recipientId);

      if (category?.categoryType === 'inventory') {
        expect(quantity, 'quantity').to.equal(request.quantity);
        expect(getProductId(product), 'productId').to.equal(request.productId);
      } else {
        expect(quantity, 'quantity').to.be.undefined;
        expect(product, 'product').to.be.undefined;
      }

      if (category?.categoryType === 'invoice') {
        expect(invoiceNumber, 'invoiceNumber').to.equal(request.invoiceNumber);
        expect(billingStartDate?.toISOString(), 'billingStartDate').to.equal(createDate(request.billingStartDate)?.toISOString());
        expect(billingEndDate?.toISOString(), 'billingEndDate').to.equal(createDate(request.billingEndDate)?.toISOString());
      } else {
        expect(invoiceNumber, 'invoiceNumber').to.be.undefined;
        expect(billingStartDate, 'billingStartDate').to.be.undefined;
        expect(billingEndDate, 'billingEndDate').to.be.undefined;
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

const validateConvertedToPaymentDocument = (originalDocument: Transaction.DeferredDocument) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((currentDocument: Transaction.PaymentDocument) => {
      const { recipient, project, category, quantity, product, invoiceNumber, billingEndDate, billingStartDate, account, amount, description, issuedAt, transactionType, ...internal } = currentDocument;

      expect(getTransactionId(currentDocument), 'id').to.equal(getTransactionId(originalDocument));
      expect(amount, 'amount').to.equal(originalDocument.amount);
      expect(issuedAt.toISOString(), 'issuedAt').to.equal(originalDocument.issuedAt.toISOString());
      expect(transactionType, 'transactionType').to.equal('payment');
      expect(description, 'description').to.equal(originalDocument.description);
      expect(getAccountId(account), 'account').to.equal(getAccountId(originalDocument.payingAccount));
      expect(getRecipientId(recipient), 'recipient').to.equal(getRecipientId(originalDocument.recipient));
      expect(getProjectId(project), 'project').to.equal(getProjectId(originalDocument.project));
      expect(getCategoryId(category), 'category').to.equal(getCategoryId(originalDocument.category));
      expect(invoiceNumber, 'invoiceNumber').to.equal(originalDocument.invoiceNumber);
      expect(billingEndDate?.toISOString(), 'billingEndDate').to.equal(originalDocument.billingEndDate?.toISOString());
      expect(billingStartDate?.toISOString(), 'billingStartDate').to.equal(originalDocument.billingStartDate?.toISOString());
      expect(getProductId(product), 'product').to.equal(getProductId(originalDocument.product));
      expect(quantity, 'quantity').to.equal(originalDocument.quantity);
      Object.keys(internal).forEach(key => expect(key, `${key} is an internal property`).to.be.oneOf(internalPropertyNames));
    });
};

const validateConvertedToRegularSplitItemDocument = (originalDocument: Transaction.SplitDocument) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((currentDocument: Transaction.SplitDocument) => {
      const { account, amount, deferredSplits, description, issuedAt, recipient, splits, transactionType, ...internal } = currentDocument;
      expect(getTransactionId(currentDocument), 'id').to.equal(getTransactionId(originalDocument));
      expect(amount, 'amount').to.equal(originalDocument.amount);
      expect(issuedAt.toISOString(), 'issuedAt').to.equal(originalDocument.issuedAt.toISOString());
      expect(transactionType, 'transactionType').to.equal(originalDocument.transactionType);
      expect(description, 'description').to.equal(originalDocument.description);
      expect(getAccountId(account), 'account').to.equal(getAccountId(originalDocument.account));
      expect(getRecipientId(recipient), 'recipient').to.equal(getRecipientId(originalDocument.recipient));

      splits?.forEach((split, index) => {
        const { amount, billingEndDate, billingStartDate, category, description, invoiceNumber, product, project, quantity, _id, ...internal } = split;
        const originalSplitItem = originalDocument.splits.find(s => s._id.toString() === _id.toString()) ?? originalDocument.deferredSplits.find(s => s._id.toString() === _id.toString());

        expect(_id.toString(), `splits.[${index}].id`).to.equal(originalSplitItem._id.toString());
        expect(amount, `splits.[${index}].amount`).to.equal(originalSplitItem.amount);
        expect(description, `splits.[${index}].description`).to.equal(originalSplitItem.description);

        expect(getProjectId(project), `splits.[${index}].project`).to.equal(getProjectId(originalSplitItem.project));
        expect(getCategoryId(category), `splits.[${index}].category`).to.equal(getCategoryId(originalSplitItem.category));
        expect(invoiceNumber, `splits.[${index}].invoiceNumber`).to.equal(originalSplitItem.invoiceNumber);
        expect(billingEndDate?.toISOString(), `splits.[${index}].billingEndDate`).to.equal(originalSplitItem.billingEndDate?.toISOString());
        expect(billingStartDate?.toISOString(), `splits.[${index}].billingStartDate`).to.equal(originalSplitItem.billingStartDate?.toISOString());
        expect(quantity, `splits.[${index}].quantity`).to.equal(originalSplitItem.quantity);
        expect(getProductId(product), `splits.[${index}].product`).to.equal(getProductId(originalSplitItem.product));

        expect(internal, 'remaining properties').to.deep.equal({});
      });

      deferredSplits?.forEach((split, index) => {
        const { amount, billingEndDate, billingStartDate, category, description, invoiceNumber, product, project, quantity, ownerAccount, payingAccount, transactionType, _id, ...internal } = split;
        const originalSplitItem = originalDocument.deferredSplits.find(s => s._id.toString() === _id.toString());

        expect(getTransactionId(split), `deferredSplits.[${index}].id`).to.equal(getTransactionId(originalSplitItem));
        expect(amount, `deferredSplits.[${index}].amount`).to.equal(originalSplitItem.amount);
        expect(description, `deferredSplits.[${index}].description`).to.equal(originalSplitItem.description);
        expect(transactionType, `deferredSplits.[${index}].transactionType`).to.equal(originalSplitItem.transactionType);
        expect(getAccountId(ownerAccount), `deferredSplits.[${index}].ownerAccount`).to.equal(getAccountId(originalSplitItem.ownerAccount));
        expect(getAccountId(payingAccount), `deferredSplits.[${index}].payingAccount`).to.equal(getAccountId(originalSplitItem.payingAccount));

        expect(getProjectId(project), `deferredSplits.[${index}].project`).to.equal(getProjectId(originalSplitItem.project));
        expect(getCategoryId(category), `deferredSplits.[${index}].category`).to.equal(getCategoryId(originalSplitItem.category));
        expect(invoiceNumber, `deferredSplits.[${index}].invoiceNumber`).to.equal(originalSplitItem.invoiceNumber);
        expect(billingEndDate?.toISOString(), `deferredSplits.[${index}].billingEndDate`).to.equal(originalSplitItem.billingEndDate?.toISOString());
        expect(billingStartDate?.toISOString(), `deferredSplits.[${index}].billingStartDate`).to.equal(originalSplitItem.billingStartDate?.toISOString());
        expect(quantity, `deferredSplits.[${index}].quantity`).to.equal(originalSplitItem.quantity);
        expect(getProductId(product), `deferredSplits.[${index}].product`).to.equal(getProductId(originalSplitItem.product));

        expect(internal, 'remaining properties').to.deep.equal({});
      });
      Object.keys(internal).forEach(key => expect(key, `${key} is an internal property`).to.be.oneOf(internalPropertyNames));
    });
};

const validateRelatedChangesInSplitDocument = (originalDocument: Transaction.SplitDocument, reassignments: {
  category?: Reassignment<Category.Document>;
  recipient?: Reassignment<Recipient.Id>;
  product?: Reassignment<Product.Id>;
  project?: Reassignment<Project.Id>;
}) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((currentDocument: Transaction.SplitDocument) => {
      const { account, amount, deferredSplits, description, issuedAt, recipient, splits, transactionType, ...internal } = currentDocument;
      expect(getTransactionId(currentDocument), 'id').to.equal(getTransactionId(originalDocument));
      expect(amount, 'amount').to.equal(originalDocument.amount);
      expect(issuedAt.toISOString(), 'issuedAt').to.equal(originalDocument.issuedAt.toISOString());
      expect(transactionType, 'transactionType').to.equal(originalDocument.transactionType);
      expect(description, 'description').to.equal(originalDocument.description);
      expect(getAccountId(account), 'account').to.equal(getAccountId(originalDocument.account));

      if (reassignments.recipient && getRecipientId(originalDocument.recipient) === reassignments.recipient.from) {
        expect(getRecipientId(recipient), 'recipient has been changed').to.equal(reassignments.recipient.to);
      } else {
        expect(getRecipientId(recipient), 'recipient').to.equal(getRecipientId(originalDocument.recipient));
      }

      splits?.forEach((split, index) => {
        const { amount, billingEndDate, billingStartDate, category, description, invoiceNumber, product, project, quantity, ...internal } = split;
        expect(amount, `splits.[${index}].amount`).to.equal(originalDocument.splits[index].amount);
        expect(description, `splits.[${index}].description`).to.equal(originalDocument.splits[index].description);

        if (reassignments.project && getProjectId(originalDocument.splits[index].project) === reassignments.project.from) {
          expect(getProjectId(project), `splits.[${index}].project has been changed`).to.equal(reassignments.project.to);
        } else {
          expect(getProjectId(project), `splits.[${index}].project`).to.equal(getProjectId(originalDocument.splits[index].project));
        }

        if (reassignments.category && getCategoryId(originalDocument.splits[index].category) === getCategoryId(reassignments.category.from)) {
          expect(getCategoryId(category), `splits.[${index}].category has been changed`).to.equal(getCategoryId(reassignments.category.to));

          if (reassignments.category.from.categoryType === reassignments.category.to?.categoryType) {
            expect(getProductId(product), `splits.[${index}].product`).to.equal(getProductId(originalDocument.splits[index].product));
            expect(quantity, `splits.[${index}].quantity`).to.equal(originalDocument.splits[index].quantity);

            expect(invoiceNumber, `splits.[${index}].invoiceNumber`).to.equal(originalDocument.splits[index].invoiceNumber);
            expect(billingEndDate?.toISOString(), `splits.[${index}].billingEndDate`).to.equal(originalDocument.splits[index].billingEndDate?.toISOString());
            expect(billingStartDate?.toISOString(), `splits.[${index}].billingStartDate`).to.equal(originalDocument.splits[index].billingStartDate?.toISOString());
          } else {
            expect(quantity, `splits.[${index}].quantity has been changed`).to.be.undefined;
            expect(product, `splits.[${index}].product has been changed`).to.be.undefined;

            expect(invoiceNumber, `splits.[${index}].invoiceNumber has been changed`).to.be.undefined;
            expect(billingEndDate, `splits.[${index}].billingEndDate has been changed`).to.be.undefined;
            expect(billingStartDate, `splits.[${index}].billingStartDate has been changed`).to.be.undefined;
          }
        } else {
          expect(getCategoryId(category), `splits.[${index}].category`).to.equal(getCategoryId(originalDocument.splits[index].category));

          expect(invoiceNumber, `splits.[${index}].invoiceNumber`).to.equal(originalDocument.splits[index].invoiceNumber);
          expect(billingEndDate?.toISOString(), `splits.[${index}].billingEndDate`).to.equal(originalDocument.splits[index].billingEndDate?.toISOString());
          expect(billingStartDate?.toISOString(), `splits.[${index}].billingStartDate`).to.equal(originalDocument.splits[index].billingStartDate?.toISOString());

          if (reassignments.product && getProductId(originalDocument.splits[index].product) === reassignments.product.from) {
            expect(getProductId(product), `splits.[${index}].product has been changed`).to.equal(reassignments.product.to);
            expect(quantity, `splits.[${index}].quantity has been changed`).to.equal(reassignments.product.to ? originalDocument.splits[index].quantity : undefined);
          }
          else {
            expect(quantity, `splits.[${index}].quantity`).to.equal(originalDocument.splits[index].quantity);
            expect(getProductId(product), `splits.[${index}].product`).to.equal(getProductId(originalDocument.splits[index].product));
          }
        }
        expect(internal, 'remaining properties').to.deep.equal({});
      });

      deferredSplits?.forEach((split, index) => {
        const { amount, billingEndDate, billingStartDate, category, description, invoiceNumber, product, project, quantity, _id, ownerAccount, payingAccount, transactionType, ...internal } = split;
        expect(getTransactionId(split), `deferredSplits.[${index}].id`).to.equal(getTransactionId(originalDocument.deferredSplits[index]));
        expect(amount, `deferredSplits.[${index}].amount`).to.equal(originalDocument.deferredSplits[index].amount);
        expect(description, `deferredSplits.[${index}].description`).to.equal(originalDocument.deferredSplits[index].description);
        expect(transactionType, `deferredSplits.[${index}].transactionType`).to.equal(originalDocument.deferredSplits[index].transactionType);
        expect(getAccountId(ownerAccount), `deferredSplits.[${index}].ownerAccount`).to.equal(getAccountId(originalDocument.deferredSplits[index].ownerAccount));
        expect(getAccountId(payingAccount), `deferredSplits.[${index}].payingAccount`).to.equal(getAccountId(originalDocument.deferredSplits[index].payingAccount));

        if (reassignments.project && getProjectId(originalDocument.deferredSplits[index].project) === reassignments.project.from) {
          expect(getProjectId(project), `deferredSplits.[${index}].project has been unset`).to.equal(reassignments.project.to);
        } else {
          expect(getProjectId(project), `deferredSplits.[${index}].project`).to.equal(getProjectId(originalDocument.deferredSplits[index].project));
        }

        if (reassignments.category && getCategoryId(originalDocument.deferredSplits[index].category) === getCategoryId(reassignments.category.from)) {
          expect(getCategoryId(category), `deferredSplits.[${index}].category has been changed`).to.equal(getCategoryId(reassignments.category.to));

          if (reassignments.category.from.categoryType === reassignments.category.to?.categoryType) {
            expect(getProductId(product), `deferredSplits.[${index}].product`).to.equal(getProductId(originalDocument.deferredSplits[index].product));
            expect(quantity, `deferredSplits.[${index}].quantity`).to.equal(originalDocument.deferredSplits[index].quantity);

            expect(invoiceNumber, `deferredSplits.[${index}].invoiceNumber`).to.equal(originalDocument.deferredSplits[index].invoiceNumber);
            expect(billingEndDate?.toISOString(), `deferredSplits.[${index}].billingEndDate`).to.equal(originalDocument.deferredSplits[index].billingEndDate?.toISOString());
            expect(billingStartDate?.toISOString(), `deferredSplits.[${index}].billingStartDate`).to.equal(originalDocument.deferredSplits[index].billingStartDate?.toISOString());
          } else {
            expect(quantity, `deferredSplits.[${index}].quantity has been changed`).to.be.undefined;
            expect(product, `deferredSplits.[${index}].product has been changed`).to.be.undefined;
            expect(invoiceNumber, `deferredSplits.[${index}].invoiceNumber has been changed`).to.be.undefined;
            expect(billingEndDate, `deferredSplits.[${index}].billingEndDate has been changed`).to.be.undefined;
            expect(billingStartDate, `deferredSplits.[${index}].billingStartDate has been changed`).to.be.undefined;
          }
        } else {
          expect(getCategoryId(category), `deferredSplits.[${index}].category`).to.equal(getCategoryId(originalDocument.deferredSplits[index].category));

          expect(invoiceNumber, `deferredSplits.[${index}].invoiceNumber`).to.equal(originalDocument.deferredSplits[index].invoiceNumber);
          expect(billingEndDate?.toISOString(), `deferredSplits.[${index}].billingEndDate`).to.equal(originalDocument.deferredSplits[index].billingEndDate?.toISOString());
          expect(billingStartDate?.toISOString(), `deferredSplits.[${index}].billingStartDate`).to.equal(originalDocument.deferredSplits[index].billingStartDate?.toISOString());

          if (reassignments.product && getProductId(originalDocument.deferredSplits[index].product) === reassignments.product.from) {
            expect(getProductId(product), `deferredSplits.[${index}].product has been changed`).to.equal(reassignments.product.to);
            expect(quantity, `deferredSplits.[${index}].quantity has been changed`).to.equal(reassignments.product.to ? originalDocument.deferredSplits[index].quantity : undefined);
          }
          else {
            expect(quantity, `deferredSplits.[${index}].quantity`).to.equal(originalDocument.deferredSplits[index].quantity);
            expect(getProductId(product), `deferredSplits.[${index}].product`).to.equal(getProductId(originalDocument.deferredSplits[index].product));
          }
        }
        expect(internal, 'remaining properties').to.deep.equal({});
      });

      Object.keys(internal).forEach(key => expect(key, `${key} is an internal property`).to.be.oneOf(internalPropertyNames));
    });
};

const validateRelatedChangesInPaymentDocument = (originalDocument: Transaction.PaymentDocument, reassignments: {
  recipient?: Reassignment<Recipient.Id>;
  project?: Reassignment<Project.Id>;
  product?: Reassignment<Product.Id>;
  category?: Reassignment<Category.Document>;
}) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((currentDocument: Transaction.PaymentDocument) => {
      const { recipient, project, category, quantity, product, invoiceNumber, billingEndDate, billingStartDate, account, amount, description, issuedAt, transactionType, ...internal } = currentDocument;

      expect(getTransactionId(currentDocument), 'id').to.equal(getTransactionId(originalDocument));
      expect(amount, 'amount').to.equal(originalDocument.amount);
      expect(issuedAt.toISOString(), 'issuedAt').to.equal(originalDocument.issuedAt.toISOString());
      expect(transactionType, 'transactionType').to.equal(originalDocument.transactionType);
      expect(description, 'description').to.equal(originalDocument.description);
      expect(getAccountId(account), 'account').to.equal(getAccountId(originalDocument.account));

      if (reassignments.recipient && getRecipientId(originalDocument.recipient) === reassignments.recipient.from) {
        expect(getRecipientId(recipient), 'recipient has been changed').to.equal(reassignments.recipient.to);
      } else {
        expect(getRecipientId(recipient), 'recipient').to.equal(getRecipientId(originalDocument.recipient));
      }

      if (reassignments.project && getProjectId(originalDocument.project) === reassignments.project.from) {
        expect(getProjectId(project), 'project has been changed').to.equal(reassignments.project.to);
      } else {
        expect(getProjectId(project), 'project').to.equal(getProjectId(originalDocument.project));
      }

      if (reassignments.category && getCategoryId(originalDocument.category) === getCategoryId(reassignments.category.from)) {
        expect(getCategoryId(category), 'category has been changed').to.equal(getCategoryId(reassignments.category.to));

        if (reassignments.category.from.categoryType === reassignments.category.to?.categoryType) {
          expect(getProductId(product), 'product').to.equal(getProductId(originalDocument.product));
          expect(quantity, 'quantity').to.equal(originalDocument.quantity);
          expect(invoiceNumber, 'invoiceNumber').to.equal(originalDocument.invoiceNumber);
          expect(billingEndDate?.toISOString(), 'billingEndDate').to.equal(originalDocument.billingEndDate?.toISOString());
          expect(billingStartDate?.toISOString(), 'billingStartDate').to.equal(originalDocument.billingStartDate?.toISOString());
        } else {
          expect(getProductId(product), 'product has been changed').to.be.undefined;
          expect(quantity, 'quantity has been changed').to.be.undefined;
          expect(invoiceNumber, 'invoiceNumber has been changed').to.be.undefined;
          expect(billingEndDate?.toISOString(), 'billingEndDate has been changed').to.be.undefined;
          expect(billingStartDate?.toISOString(), 'billingStartDate has been changed').to.be.undefined;
        }
      } else {
        expect(getCategoryId(category), 'category').to.equal(getCategoryId(originalDocument.category));
        expect(invoiceNumber, 'invoiceNumber').to.equal(originalDocument.invoiceNumber);
        expect(billingEndDate?.toISOString(), 'billingEndDate').to.equal(originalDocument.billingEndDate?.toISOString());
        expect(billingStartDate?.toISOString(), 'billingStartDate').to.equal(originalDocument.billingStartDate?.toISOString());

        if (reassignments.product && getProductId(originalDocument.product) === reassignments.product.from) {
          expect(getProductId(product), 'product has been changed').to.equal(reassignments.product.to);
          expect(quantity, 'quantity has been changed').to.equal(reassignments.product.to ? originalDocument.quantity : undefined);
        } else {
          expect(getProductId(product), 'product').to.equal(getProductId(originalDocument.product));
          expect(quantity, 'quantity').to.equal(originalDocument.quantity);
        }
      }
      Object.keys(internal).forEach(key => expect(key, `${key} is an internal property`).to.be.oneOf(internalPropertyNames));
    });
};

const validateRelatedChangesInDeferredDocument = (originalDocument: Transaction.DeferredDocument, reassignments: {
  recipient?: Reassignment<Recipient.Id>;
  project?: Reassignment<Project.Id>;
  product?: Reassignment<Product.Id>;
  category?: Reassignment<Category.Document>;
}) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((currentDocument: Transaction.DeferredDocument) => {
      const { recipient, project, category, quantity, product, invoiceNumber, billingEndDate, billingStartDate, payingAccount, ownerAccount, amount, description, issuedAt, transactionType, ...internal } = currentDocument;

      expect(getTransactionId(currentDocument), 'id').to.equal(getTransactionId(originalDocument));
      expect(amount, 'amount').to.equal(originalDocument.amount);
      expect(issuedAt.toISOString(), 'issuedAt').to.equal(originalDocument.issuedAt.toISOString());
      expect(transactionType, 'transactionType').to.equal(originalDocument.transactionType);
      expect(description, 'description').to.equal(originalDocument.description);
      expect(getAccountId(payingAccount), 'payingAccount').to.equal(getAccountId(originalDocument.payingAccount));
      expect(getAccountId(ownerAccount), 'ownerAccount').to.equal(getAccountId(originalDocument.ownerAccount));

      if (reassignments.recipient && getRecipientId(originalDocument.recipient) === reassignments.recipient.from) {
        expect(getRecipientId(recipient), 'recipient has been changed').to.equal(reassignments.recipient.to);
      } else {
        expect(getRecipientId(recipient), 'recipient').to.equal(getRecipientId(originalDocument.recipient));
      }

      if (reassignments.project && getProjectId(originalDocument.project) === reassignments.project.from) {
        expect(getProjectId(project), 'project has been changed').to.equal(reassignments.project.to);
      } else {
        expect(getProjectId(project), 'project').to.equal(getProjectId(originalDocument.project));
      }

      if (reassignments.category && getCategoryId(originalDocument.category) === getCategoryId(reassignments.category.from)) {
        expect(getCategoryId(category), 'category has been changed').to.equal(getCategoryId(reassignments.category.to));

        if (reassignments.category.from.categoryType === reassignments.category.to?.categoryType) {
          expect(getProductId(product), 'product').to.equal(getProductId(originalDocument.product));
          expect(quantity, 'quantity').to.equal(originalDocument.quantity);
          expect(invoiceNumber, 'invoiceNumber').to.equal(originalDocument.invoiceNumber);
          expect(billingEndDate?.toISOString(), 'billingEndDate').to.equal(originalDocument.billingEndDate?.toISOString());
          expect(billingStartDate?.toISOString(), 'billingStartDate').to.equal(originalDocument.billingStartDate?.toISOString());
        } else {
          expect(getProductId(product), 'product has been changed').to.be.undefined;
          expect(quantity, 'quantity has been changed').to.be.undefined;
          expect(invoiceNumber, 'invoiceNumber has been changed').to.be.undefined;
          expect(billingEndDate?.toISOString(), 'billingEndDate has been changed').to.be.undefined;
          expect(billingStartDate?.toISOString(), 'billingStartDate has been changed').to.be.undefined;
        }
      } else {
        expect(getCategoryId(category), 'category').to.equal(getCategoryId(originalDocument.category));
        expect(invoiceNumber, 'invoiceNumber').to.equal(originalDocument.invoiceNumber);
        expect(billingEndDate?.toISOString(), 'billingEndDate').to.equal(originalDocument.billingEndDate?.toISOString());
        expect(billingStartDate?.toISOString(), 'billingStartDate').to.equal(originalDocument.billingStartDate?.toISOString());

        if (reassignments.product && getProductId(originalDocument.product) === reassignments.product.from) {
          expect(getProductId(product), 'product has been changed').to.equal(reassignments.product.to);
          expect(quantity, 'quantity has been changed').to.equal(reassignments.product.to ? originalDocument.quantity : undefined);
        } else {
          expect(getProductId(product), 'product').to.equal(getProductId(originalDocument.product));
          expect(quantity, 'quantity').to.equal(originalDocument.quantity);
        }
      }
      Object.keys(internal).forEach(key => expect(key, `${key} is an internal property`).to.be.oneOf(internalPropertyNames));
    });
};

const validateRelatedChangesInReimbursementDocument = (originalDocument: Transaction.ReimbursementDocument, reassignments: {
  recipient?: Reassignment<Recipient.Id>;
  project?: Reassignment<Project.Id>;
  product?: Reassignment<Product.Id>;
  category?: Reassignment<Category.Document>;
}) => {
  const transactionId = getTransactionId(originalDocument);

  cy.log('Get transaction document', transactionId)
    .getTransactionDocumentById(transactionId)
    .should((currentDocument: Transaction.ReimbursementDocument) => {
      const { recipient, project, category, quantity, product, invoiceNumber, billingEndDate, billingStartDate, payingAccount, ownerAccount, amount, description, issuedAt, transactionType, ...internal } = currentDocument;

      expect(getTransactionId(currentDocument), 'id').to.equal(getTransactionId(originalDocument));
      expect(amount, 'amount').to.equal(originalDocument.amount);
      expect(issuedAt.toISOString(), 'issuedAt').to.equal(originalDocument.issuedAt.toISOString());
      expect(transactionType, 'transactionType').to.equal(originalDocument.transactionType);
      expect(description, 'description').to.equal(originalDocument.description);
      expect(getAccountId(payingAccount), 'payingAccount').to.equal(getAccountId(originalDocument.payingAccount));
      expect(getAccountId(ownerAccount), 'ownerAccount').to.equal(getAccountId(originalDocument.ownerAccount));

      if (reassignments.recipient && getRecipientId(originalDocument.recipient) === reassignments.recipient.from) {
        expect(getRecipientId(recipient), 'recipient has been changed').to.equal(reassignments.recipient.to);
      } else {
        expect(getRecipientId(recipient), 'recipient').to.equal(getRecipientId(originalDocument.recipient));
      }

      if (reassignments.project && getProjectId(originalDocument.project) === reassignments.project.from) {
        expect(getProjectId(project), 'project has been changed').to.equal(reassignments.project.to);
      } else {
        expect(getProjectId(project), 'project').to.equal(getProjectId(originalDocument.project));
      }

      if (reassignments.category && getCategoryId(originalDocument.category) === getCategoryId(reassignments.category.from)) {
        expect(getCategoryId(category), 'category has been changed').to.equal(getCategoryId(reassignments.category.to));

        if (reassignments.category.from.categoryType === reassignments.category.to?.categoryType) {
          expect(getProductId(product), 'product').to.equal(getProductId(originalDocument.product));
          expect(quantity, 'quantity').to.equal(originalDocument.quantity);
          expect(invoiceNumber, 'invoiceNumber').to.equal(originalDocument.invoiceNumber);
          expect(billingEndDate?.toISOString(), 'billingEndDate').to.equal(originalDocument.billingEndDate?.toISOString());
          expect(billingStartDate?.toISOString(), 'billingStartDate').to.equal(originalDocument.billingStartDate?.toISOString());
        } else {
          expect(getProductId(product), 'product has been changed').to.be.undefined;
          expect(quantity, 'quantity has been changed').to.be.undefined;
          expect(invoiceNumber, 'invoiceNumber has been changed').to.be.undefined;
          expect(billingEndDate?.toISOString(), 'billingEndDate has been changed').to.be.undefined;
          expect(billingStartDate?.toISOString(), 'billingStartDate has been changed').to.be.undefined;
        }
      } else {
        expect(getCategoryId(category), 'category').to.equal(getCategoryId(originalDocument.category));
        expect(invoiceNumber, 'invoiceNumber').to.equal(originalDocument.invoiceNumber);
        expect(billingEndDate?.toISOString(), 'billingEndDate').to.equal(originalDocument.billingEndDate?.toISOString());
        expect(billingStartDate?.toISOString(), 'billingStartDate').to.equal(originalDocument.billingStartDate?.toISOString());

        if (reassignments.product && getProductId(originalDocument.product) === reassignments.product.from) {
          expect(getProductId(product), 'product has been changed').to.equal(reassignments.product.to);
          expect(quantity, 'quantity has been changed').to.equal(reassignments.product.to ? originalDocument.quantity : undefined);
        } else {
          expect(getProductId(product), 'product').to.equal(getProductId(originalDocument.product));
          expect(quantity, 'quantity').to.equal(originalDocument.quantity);
        }
      }
      Object.keys(internal).forEach(key => expect(key, `${key} is an internal property`).to.be.oneOf(internalPropertyNames));
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
    validateConvertedToPaymentDocument,
    validateConvertedToRegularSplitItemDocument,
    validateRelatedChangesInSplitDocument,
    validateRelatedChangesInPaymentDocument,
    validateRelatedChangesInDeferredDocument,
    validateRelatedChangesInReimbursementDocument,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateTransactionDeleted: CommandFunction<typeof validateTransactionDeleted>;
      validateConvertedToPaymentDocument: CommandFunction<typeof validateConvertedToPaymentDocument>;
      validateConvertedToRegularSplitItemDocument: CommandFunction<typeof validateConvertedToRegularSplitItemDocument>;
      validateRelatedChangesInSplitDocument: CommandFunction<typeof validateRelatedChangesInSplitDocument>;
      validateRelatedChangesInPaymentDocument: CommandFunction<typeof validateRelatedChangesInPaymentDocument>;
      validateRelatedChangesInDeferredDocument: CommandFunction<typeof validateRelatedChangesInDeferredDocument>;
      validateRelatedChangesInReimbursementDocument: CommandFunction<typeof validateRelatedChangesInReimbursementDocument>;
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
