import { Account, Category, Internal, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { createDate, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';

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
      expectRemainingProperties(internal);
    });
};

const validateTransactionDeferredDocument = (response: Transaction.TransactionId, request: Transaction.PaymentRequest) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .getTransactionDocumentById(id)
    .should((document: Transaction.DeferredDocument) => {
      expect(getTransactionId(document), 'id').to.equal(id);
      const { amount, issuedAt, transactionType, description, payingAccount, ownerAccount, category, project, recipient, quantity, product, invoiceNumber, billingEndDate, billingStartDate, isSettled, ...internal } = document;

      expect(amount, 'amount').to.equal(request.amount);
      expect(issuedAt.toISOString(), 'issuedAt').to.equal(createDate(request.issuedAt).toISOString());
      expect(transactionType, 'transactionType').to.equal('deferred');
      expect(description, 'description').to.equal(request.description);
      expect(isSettled, 'isSettled').to.equal(request.isSettled ?? false);
      expect(getAccountId(payingAccount), 'payingAccount').to.equal(request.accountId);
      expect(getAccountId(ownerAccount), 'ownerAccount').to.equal(request.loanAccountId);
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
      expectRemainingProperties(internal);
    });
};

const validateTransactionReimbursementDocument = (response: Transaction.TransactionId, request: Transaction.PaymentRequest) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .getTransactionDocumentById(id)
    .should((document: Transaction.ReimbursementDocument) => {
      expect(getTransactionId(document), 'id').to.equal(id);
      const { amount, issuedAt, transactionType, description, payingAccount, ownerAccount, category, project, recipient, quantity, product, invoiceNumber, billingEndDate, billingStartDate, ...internal } = document;
      expect(amount, 'amount').to.equal(request.amount);
      expect(issuedAt.toISOString(), 'issuedAt').to.equal(createDate(request.issuedAt).toISOString());
      expect(transactionType, 'transactionType').to.equal('reimbursement');
      expect(description, 'description').to.equal(request.description);
      expect(getAccountId(payingAccount), 'payingAccount').to.equal(request.accountId);
      expect(getAccountId(ownerAccount), 'ownerAccount').to.equal(request.loanAccountId);
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
      expectRemainingProperties(internal);
    });
};

const validateTransactionSplitDocument = (response: Transaction.TransactionId, request: Transaction.SplitRequest) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .getTransactionDocumentById(id)
    .should((document: Transaction.SplitDocument) => {
      const { amount, issuedAt, transactionType, deferredSplits, description, recipient, splits, account, ...internal } = document;

      expect(getTransactionId(document), 'id').to.equal(id);
      expect(amount, 'amount').to.equal(request.amount);
      expect(issuedAt.toISOString(), 'issuedAt').to.equal(createDate(request.issuedAt).toISOString());
      expect(transactionType, 'transactionType').to.equal('split');
      expect(description, 'description').to.equal(request.description);
      expect(getAccountId(account), 'account').to.equal(request.accountId);
      expect(getRecipientId(recipient), 'recipient').to.equal(request.recipientId);

      const regularSplitRequests = request.splits.filter(s => !s.loanAccountId);
      const deferredsplitRequests = request.splits.filter(s => s.loanAccountId);

      splits?.forEach((split, index) => {
        const { amount, description, project, product, category, quantity, billingEndDate, billingStartDate, invoiceNumber, ...internal } = split;
        const splitRequestItem = regularSplitRequests[index];

        expect(amount, `splits[${index}].amount`).to.equal(splitRequestItem.amount);
        expect(description, `splits[${index}].description`).to.equal(splitRequestItem.description);
        expect(getProjectId(project), `splits[${index}].project`).to.equal(splitRequestItem.projectId);
        expect(getCategoryId(category), `splits[${index}].category`).to.equal(splitRequestItem.categoryId);

        if (category?.categoryType === 'inventory') {
          expect(quantity, `splits[${index}].quantity`).to.equal(splitRequestItem.quantity);
          expect(getProductId(product), `splits[${index}].productId`).to.equal(splitRequestItem.productId);
        } else {
          expect(quantity, `splits[${index}].quantity`).to.be.undefined;
          expect(product, `splits[${index}].product`).to.be.undefined;
        }

        if (category?.categoryType === 'invoice') {
          expect(invoiceNumber, `splits[${index}].invoiceNumber`).to.equal(splitRequestItem.invoiceNumber);
          expect(billingStartDate?.toISOString(), `splits[${index}].billingStartDate`).to.equal(createDate(splitRequestItem.billingStartDate)?.toISOString());
          expect(billingEndDate?.toISOString(), `splits[${index}].billingEndDate`).to.equal(createDate(splitRequestItem.billingEndDate)?.toISOString());
        } else {
          expect(invoiceNumber, `splits[${index}].invoiceNumber`).to.be.undefined;
          expect(billingStartDate, `splits[${index}].billingStartDate`).to.be.undefined;
          expect(billingEndDate, `splits[${index}].billingEndDate`).to.be.undefined;
        }
        expectRemainingProperties(internal);
      });

      deferredSplits?.forEach((split, index) => {
        const { amount, description, project, product, category, quantity, billingEndDate, billingStartDate, invoiceNumber, payingAccount, ownerAccount, transactionType, isSettled, ...internal } = split;
        const splitRequestItem = deferredsplitRequests[index];

        expect(amount, `deferredSplits[${index}].amount`).to.equal(splitRequestItem.amount);
        expect(description, `deferredSplits[${index}].description`).to.equal(splitRequestItem.description);
        expect(isSettled, `deferredSplits[${index}].isSettled`).to.equal(splitRequestItem.isSettled ?? false);
        expect(transactionType, `deferredSplits[${index}].transactionType`).to.equal('deferred');
        expect(getProjectId(project), `deferredSplits[${index}].project`).to.equal(splitRequestItem.projectId);
        expect(getCategoryId(category), `deferredSplits[${index}].category`).to.equal(splitRequestItem.categoryId);
        expect(getAccountId(payingAccount), `deferredSplits[${index}].payingAccount`).to.equal(request.accountId);
        expect(getAccountId(ownerAccount), `deferredSplits[${index}].ownerAccount`).to.equal(splitRequestItem.loanAccountId);

        if (category?.categoryType === 'inventory') {
          expect(quantity, `deferredSplits[${index}].quantity`).to.equal(splitRequestItem.quantity);
          expect(getProductId(product), `deferredSplits[${index}].productId`).to.equal(splitRequestItem.productId);
        } else {
          expect(quantity, `deferredSplits[${index}].quantity`).to.be.undefined;
          expect(product, `deferredSplits[${index}].product`).to.be.undefined;
        }

        if (category?.categoryType === 'invoice') {
          expect(invoiceNumber, `deferredSplits[${index}].invoiceNumber`).to.equal(splitRequestItem.invoiceNumber);
          expect(billingStartDate?.toISOString(), `deferredSplits[${index}].billingStartDate`).to.equal(createDate(splitRequestItem.billingStartDate)?.toISOString());
          expect(billingEndDate?.toISOString(), `deferredSplits[${index}].billingEndDate`).to.equal(createDate(splitRequestItem.billingEndDate)?.toISOString());
        } else {
          expect(invoiceNumber, `deferredSplits[${index}].invoiceNumber`).to.be.undefined;
          expect(billingStartDate, `deferredSplits[${index}].billingStartDate`).to.be.undefined;
          expect(billingEndDate, `deferredSplits[${index}].billingEndDate`).to.be.undefined;
        }
        expectRemainingProperties(internal);
      });

      expectRemainingProperties(internal);
    });
};

const validateTransactionTransferDocument = (response: Transaction.TransactionId, request: Transaction.TransferRequest, paymentAmounts?: number[]) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .getTransactionDocumentById(id)
    .should((document: Transaction.TransferDocument) => {
      const { amount, issuedAt, transactionType, description, transferAccount, transferAmount, account, payments, ...internal } = document;

      expect(getTransactionId(document), 'id').to.equal(id);
      expect(amount, 'amount').to.equal(request.amount);
      expect(issuedAt.toISOString(), 'issuedAt').to.equal(createDate(request.issuedAt).toISOString());
      expect(transactionType, 'transactionType').to.equal('transfer');
      expect(description, 'description').to.equal(request.description);
      expect(transferAmount, 'transferAmount').to.equal(request.transferAmount ?? request.amount * -1);
      expect(getAccountId(account), 'account').to.equal(request.accountId);
      expect(getAccountId(transferAccount), 'transferAccount').to.equal(request.transferAccountId);

      payments?.forEach((payment, index) => {
        const paymentRequest = request.payments[index];

        const { amount, transaction, ...internal } = payment;
        expect(amount, `payments[${index}].amount`).to.equal(paymentAmounts?.[index] ?? paymentRequest.amount);
        expect(getTransactionId(transaction), `payments[${index}].transaction`).to.equal(paymentRequest.transactionId);
        expectRemainingProperties(internal);
      });

      expectRemainingProperties(internal);
    });
};

const validateTransactionLoanTransferDocument = (response: Transaction.TransactionId, request: Transaction.TransferRequest) => {
  const id = response?.transactionId;

  cy.log('Get transaction document', id)
    .getTransactionDocumentById(id)
    .should((document: Transaction.LoanTransferDocument) => {
      const { amount, issuedAt, transactionType, description, transferAccount, account, ...internal } = document;

      expect(getTransactionId(document), 'id').to.equal(id);
      expect(amount, 'amount').to.equal(request.amount);
      expect(issuedAt.toISOString(), 'issuedAt').to.equal(createDate(request.issuedAt).toISOString());
      expect(transactionType, 'transactionType').to.equal('loanTransfer');
      expect(description, 'description').to.equal(request.description);
      expect(getAccountId(account), 'account').to.equal(request.accountId);
      expect(getAccountId(transferAccount), 'transferAccount').to.equal(request.transferAccountId);

      expectRemainingProperties(internal);
    });
};

const validateInventoryResponse = (response: Transaction.Quantity & Transaction.Product<Product.Response>, document: Transaction.Quantity & Transaction.Product<Product.Document>, nestedPath: string = '') => {
  const { quantity, product } = response;
  const { productId, brand, measurement, unitOfMeasurement, fullName, ...empty } = product;

  expect(quantity, `${nestedPath}quantity`).to.equal(document.quantity);
  expect(productId, `${nestedPath}product.productId`).to.equal(getProductId(document.product));
  expect(brand, `${nestedPath}product.brand`).to.equal(document.product.brand);
  expect(measurement, `${nestedPath}product.measurement`).to.equal(document.product.measurement);
  expect(unitOfMeasurement, `${nestedPath}product.unitOfMeasurement`).to.equal(document.product.unitOfMeasurement);
  expect(fullName, `${nestedPath}product.fullName`).to.equal(document.product.fullName);
  expectEmptyObject(empty, `${nestedPath}product.`);
};

const validateInvoiceResponse = (response: Transaction.InvoiceDate<string> & Transaction.InvoiceNumber, document: Transaction.InvoiceNumber & Transaction.InvoiceDate<Date>, nestedPath: string = '') => {
  const { billingEndDate, billingStartDate, invoiceNumber } = response;
  expect(invoiceNumber, `${nestedPath}invoiceNumber`).to.equal(document.invoiceNumber);
  expect(createDate(billingStartDate)?.toISOString(), `${nestedPath}billingStartDate`).to.equal(document.billingStartDate?.toISOString());
  expect(createDate(billingEndDate)?.toISOString(), `${nestedPath}billingEndDate`).to.equal(document.billingEndDate?.toISOString());
};

const validateCommonResponse = (response: Transaction.TransactionId & Transaction.Amount & Transaction.IssuedAt<string> & Transaction.TransactionType<string> & Transaction.Description, document: Transaction.Document) => {
  const { amount, description, issuedAt, transactionId, transactionType } = response;

  expect(transactionId).to.equal(getTransactionId(document));
  expect(amount, 'amount').to.equal(document.amount);
  expect(createDate(issuedAt).toISOString(), 'issuedAt').to.equal(document.issuedAt.toISOString());
  expect(transactionType, 'transactionType').to.equal(document.transactionType);
  expect(description, 'description').to.equal(document.description);
};

const validateTransactionPaymentResponse = (response: Transaction.PaymentResponse, document: Transaction.PaymentDocument) => {
  const { transactionId, amount, issuedAt, transactionType, description, account, project, product, recipient, category, billingEndDate, billingStartDate, invoiceNumber, quantity, ...empty } = response;

  validateCommonResponse({
    amount,
    description,
    issuedAt,
    transactionId,
    transactionType,
  }, document);

  cy.validateNestedAccountResponse('account.', account, document.account, document.account.balance ?? null);

  if (project) {
    cy.validateNestedProjectResponse('project.', project, document.project);
  } else {
    expect(project, 'project').to.be.undefined;
  }

  if (recipient) {
    cy.validateNestedRecipientResponse('recipient.', recipient, document.recipient);
  } else {
    expect(recipient, 'recipient').to.be.undefined;
  }

  if (category) {
    cy.validateNestedCategoryResponse('category.', category, document.category);
  } else {
    expect(category, 'category').to.be.undefined;
  }

  if (category?.categoryType === 'inventory' && product) {
    validateInventoryResponse({
      product,
      quantity,
    }, document);
  } else {
    expect(quantity, 'quantity').to.be.undefined;
    expect(product, 'product').to.be.undefined;
  }

  if (category?.categoryType === 'invoice') {
    validateInvoiceResponse({
      billingEndDate,
      billingStartDate,
      invoiceNumber,
    }, document);
  } else {
    expect(invoiceNumber, 'invoiceNumber').to.be.undefined;
    expect(billingStartDate, 'billingStartDate').to.be.undefined;
    expect(billingEndDate, 'billingEndDate').to.be.undefined;
  }
  expectEmptyObject(empty, 'response');
};

const validateTransactionDeferredResponse = (response: Transaction.DeferredResponse, document: Transaction.DeferredDocument, viewingAccountId: Account.Id, paymentAmount?: number) => {
  const { transactionId, amount, issuedAt, transactionType, description, payingAccount, ownerAccount, project, product, recipient, category, billingEndDate, billingStartDate, invoiceNumber, quantity, remainingAmount, isSettled, ...empty } = response;

  const expectedRemainingAmount = viewingAccountId === ownerAccount.accountId ? Math.abs(document.amount) - (paymentAmount ?? 0) : (Math.abs(document.amount) - (paymentAmount ?? 0)) * -1;

  validateCommonResponse({
    amount,
    description,
    issuedAt,
    transactionId,
    transactionType,
  }, document);
  expect(isSettled, 'isSettled').to.equal(document.isSettled ?? false);
  expect(remainingAmount, 'remainingAmount').to.equal(document.isSettled ? 0 : expectedRemainingAmount);

  cy.validateNestedAccountResponse('payingAccount.', payingAccount, document.payingAccount, document.payingAccount.balance ?? null)
    .validateNestedAccountResponse('ownerAccount.', ownerAccount, document.ownerAccount, document.ownerAccount.balance ?? null);

  if (project) {
    cy.validateNestedProjectResponse('project.', project, document.project);
  } else {
    expect(project, 'project').to.be.undefined;
  }

  if (recipient) {
    cy.validateNestedRecipientResponse('recipient.', recipient, document.recipient);
  } else {
    expect(recipient, 'recipient').to.be.undefined;
  }

  if (category) {
    cy.validateNestedCategoryResponse('category.', category, document.category);
  } else {
    expect(category, 'category').to.be.undefined;
  }

  if (category?.categoryType === 'inventory' && product) {
    validateInventoryResponse({
      product,
      quantity,
    }, document);
  } else {
    expect(quantity, 'quantity').to.be.undefined;
    expect(product, 'product').to.be.undefined;
  }

  if (category?.categoryType === 'invoice') {
    validateInvoiceResponse({
      billingEndDate,
      billingStartDate,
      invoiceNumber,
    }, document);
  } else {
    expect(invoiceNumber, 'invoiceNumber').to.be.undefined;
    expect(billingStartDate, 'billingStartDate').to.be.undefined;
    expect(billingEndDate, 'billingEndDate').to.be.undefined;
  }
  expectEmptyObject(empty, 'response');
};

const validateTransactionReimbursementResponse = (response: Transaction.ReimbursementResponse, document: Transaction.ReimbursementDocument) => {
  const { transactionId, amount, issuedAt, transactionType, description, payingAccount, ownerAccount, project, product, recipient, category, billingEndDate, billingStartDate, invoiceNumber, quantity, ...empty } = response;

  validateCommonResponse({
    amount,
    description,
    issuedAt,
    transactionId,
    transactionType,
  }, document);

  cy.validateNestedAccountResponse('payingAccount.', payingAccount, document.payingAccount, document.payingAccount.balance ?? null)
    .validateNestedAccountResponse('ownerAccount.', ownerAccount, document.ownerAccount, document.ownerAccount.balance ?? null);

  if (project) {
    cy.validateNestedProjectResponse('project.', project, document.project);
  } else {
    expect(project, 'project').to.be.undefined;
  }

  if (recipient) {
    cy.validateNestedRecipientResponse('recipient.', recipient, document.recipient);
  } else {
    expect(recipient, 'recipient').to.be.undefined;
  }

  if (category) {
    cy.validateNestedCategoryResponse('category.', category, document.category);
  } else {
    expect(category, 'category').to.be.undefined;
  }

  if (category?.categoryType === 'inventory' && product) {
    validateInventoryResponse({
      product,
      quantity,
    }, document);
  } else {
    expect(quantity, 'quantity').to.be.undefined;
    expect(product, 'product').to.be.undefined;
  }

  if (category?.categoryType === 'invoice') {
    validateInvoiceResponse({
      billingEndDate,
      billingStartDate,
      invoiceNumber,
    }, document, '');
  } else {
    expect(invoiceNumber, 'invoiceNumber').to.be.undefined;
    expect(billingStartDate, 'billingStartDate').to.be.undefined;
    expect(billingEndDate, 'billingEndDate').to.be.undefined;
  }
  expectEmptyObject(empty, 'reponse');
};

const validateTransactionTransferResponse = (response: Transaction.TransferResponse, document: Transaction.TransferDocument, viewingAccountId: Account.Id) => {
  const documentAmount = getAccountId(document.account) === viewingAccountId ? document.amount : document.transferAmount;
  const documentAccount = getAccountId(document.account) === viewingAccountId ? document.account : document.transferAccount;
  const documentTransferAmount = getAccountId(document.account) === viewingAccountId ? document.transferAmount : document.amount;
  const documentTransferAccount = getAccountId(document.account) === viewingAccountId ? document.transferAccount : document.account;

  const { transactionId, amount, issuedAt, transactionType, description, account, transferAccount, transferAmount, payments, ...empty } = response;

  validateCommonResponse({
    amount,
    description,
    issuedAt,
    transactionId,
    transactionType,
  }, {
    ...document,
    amount: documentAmount,
  });
  expect(transferAmount, 'transferAmount').to.equal(documentTransferAmount);

  cy.validateNestedAccountResponse('account.', account, documentAccount, documentAccount.balance ?? null)
    .validateNestedAccountResponse('transferAccount.', transferAccount, documentTransferAccount, documentTransferAccount.balance ?? null);

  payments?.forEach((p, index) => {
    const documentItem = document.payments[index];
    const { amount, transactionId } = p;

    expect(amount, `payments[${index}].amount`).to.equal(documentItem.amount);
    expect(transactionId, `payments[${index}].transactionId`).to.equal(getTransactionId(documentItem.transaction));
  });
  expectEmptyObject(empty, 'response');

};

const validateTransactionLoanTransferResponse = (response: Transaction.LoanTransferResponse, document: Transaction.LoanTransferDocument, viewingAccountId: Account.Id) => {
  const documentAccount = getAccountId(document.account) === viewingAccountId ? document.account : document.transferAccount;
  const documentTransferAccount = getAccountId(document.account) === viewingAccountId ? document.transferAccount : document.account;

  const { transactionId, amount, issuedAt, transactionType, description, account, transferAccount, ...empty } = response;

  validateCommonResponse({
    amount,
    description,
    issuedAt,
    transactionId,
    transactionType,
  }, document);

  cy.validateNestedAccountResponse('account.', account, documentAccount, documentAccount.balance ?? null)
    .validateNestedAccountResponse('transferAccount.', transferAccount, documentTransferAccount, documentTransferAccount.balance ?? null);
  expectEmptyObject(empty, 'response');
};

const validateTransactionSplitResponse = (response: Transaction.SplitResponse, document: Transaction.SplitDocument, repayments?: Record<Transaction.Id, number>) => {

  const { transactionId, amount, issuedAt, transactionType, description, account, deferredSplits, splits, recipient, ...empty } = response;

  validateCommonResponse({
    amount,
    description,
    issuedAt,
    transactionId,
    transactionType,
  }, document);

  cy.validateNestedAccountResponse('account.', account, document.account, document.account.balance ?? null);

  if (recipient) {
    cy.validateNestedRecipientResponse('recipient.', recipient, document.recipient);
  } else {
    expect(recipient, 'recipient').to.be.undefined;
  }

  splits.forEach((split, index) => {
    const documentSplit = document.splits[index];
    const { amount, billingEndDate, billingStartDate, category, description, invoiceNumber, product, project, quantity, ...empty } = split;

    expect(amount, `splits[${index}].amount`).to.equal(documentSplit.amount);
    expect(description, `splits[${index}].description`).to.equal(documentSplit.description);

    if (project) {
      cy.validateNestedProjectResponse(`splits[${index}].project.`, project, documentSplit.project);
    } else {
      expect(project, `splits[${index}].project`).to.be.undefined;
    }

    if (category) {
      cy.validateNestedCategoryResponse(`splits[${index}].category`, category, documentSplit.category);
    } else {
      expect(category, `splits[${index}].category`).to.be.undefined;
    }

    if (category?.categoryType === 'inventory' && product) {
      validateInventoryResponse({
        product,
        quantity,
      }, documentSplit, `splits[${index}].`);
    } else {
      expect(quantity, `splits[${index}].quantity`).to.be.undefined;
      expect(product, `splits[${index}].product`).to.be.undefined;
    }

    if (category?.categoryType === 'invoice') {
      validateInvoiceResponse({
        billingEndDate,
        billingStartDate,
        invoiceNumber,
      }, documentSplit, `splits[${index}].`);
    } else {
      expect(invoiceNumber, `splits[${index}].invoiceNumber`).to.be.undefined;
      expect(billingStartDate, `splits[${index}].billingStartDate`).to.be.undefined;
      expect(billingEndDate, `splits[${index}].billingEndDate`).to.be.undefined;
    }
    expectEmptyObject(empty, 'response');
  });

  deferredSplits.forEach((split, index) => {
    const documentSplit = document.deferredSplits[index];
    const { amount, billingEndDate, billingStartDate, category, description, invoiceNumber, product, project, quantity, ownerAccount, payingAccount, transactionType, remainingAmount, transactionId, isSettled, ...empty } = split;

    expect(transactionId, `deferredSplits[${index}].transactionId`).to.equal(getTransactionId(documentSplit));
    expect(amount, `deferredSplits[${index}].amount`).to.equal(documentSplit.amount);
    expect(transactionType, `deferredSplits[${index}].transactionType`).to.equal('deferred');
    expect(remainingAmount, `deferredSplits[${index}].remainingAmount`).to.equal(documentSplit.isSettled ? 0 : documentSplit.amount + (repayments?.[transactionId] ?? 0));
    expect(description, `deferredSplits[${index}].description`).to.equal(documentSplit.description);
    expect(isSettled, `deferredSplits[${index}].isSettled`).to.equal(documentSplit.isSettled);

    cy.validateNestedAccountResponse(`deferredSplits[${index}].payingAccount`, payingAccount, documentSplit.payingAccount, documentSplit.payingAccount.balance ?? null)
      .validateNestedAccountResponse(`deferredSplits[${index}].ownerAccount`, ownerAccount, documentSplit.ownerAccount, documentSplit.ownerAccount.balance ?? null);

    if (project) {
      cy.validateNestedProjectResponse(`deferredSplits[${index}].project.`, project, documentSplit.project);
    } else {
      expect(project, `deferredSplits[${index}].project`).to.be.undefined;
    }

    if (category) {
      cy.validateNestedCategoryResponse(`deferredSplits[${index}].category`, category, documentSplit.category);
    } else {
      expect(category, `deferredSplits[${index}].category`).to.be.undefined;
    }

    if (category?.categoryType === 'inventory' && product) {
      validateInventoryResponse({
        product,
        quantity,
      }, documentSplit, `deferredSplits[${index}].`);
    } else {
      expect(quantity, `deferredSplits[${index}].quantity`).to.be.undefined;
      expect(product, `deferredSplits[${index}].product`).to.be.undefined;
    }

    if (category?.categoryType === 'invoice') {
      validateInvoiceResponse({
        billingEndDate,
        billingStartDate,
        invoiceNumber,
      }, documentSplit, `deferredSplits[${index}].`);
    } else {
      expect(invoiceNumber, `deferredSplits[${index}].invoiceNumber`).to.be.undefined;
      expect(billingStartDate, `deferredSplits[${index}].billingStartDate`).to.be.undefined;
      expect(billingEndDate, `deferredSplits[${index}].billingEndDate`).to.be.undefined;
    }
    expectEmptyObject(empty, `deferredSplits[${index}]`);
  });
  expectEmptyObject(empty, 'response');
};

const validateTransactionListResponse = (responses: Transaction.Response[], documents: Transaction.Document[], viewingAccountId: Account.Id, repayments: Record<Transaction.Id, number>) => {
  documents.forEach((document) => {
    const response = responses.find(r => r.transactionId === getTransactionId(document));
    switch(response.transactionType) {
      case 'payment': validateTransactionPaymentResponse(response, document as Transaction.PaymentDocument); break;
      case 'transfer': validateTransactionTransferResponse(response, document as Transaction.TransferDocument, viewingAccountId); break;
      case 'split': validateTransactionSplitResponse(response, document as Transaction.SplitDocument, repayments); break;
      case 'deferred': validateTransactionDeferredResponse(response, document as Transaction.DeferredDocument, viewingAccountId, repayments[response.transactionId]); break;
      case 'reimbursement': validateTransactionReimbursementResponse(response, document as Transaction.ReimbursementDocument); break;
      case 'loanTransfer': validateTransactionLoanTransferResponse(response, document as Transaction.LoanTransferDocument, viewingAccountId); break;
    }
  });
};

const validateTransactionListReport = (reports: Transaction.Report[], documents: (Transaction.PaymentDocument | Transaction.DeferredDocument | Transaction.ReimbursementDocument | Transaction.ReportDocument)[]) => {
  const total = documents?.length ?? 0;
  expect(reports.length, 'number of items').to.equal(total);
  reports.forEach((report, index) => {
    const document = documents.find(d => report.transactionId === getTransactionId(d) && report.splitId === (d as Transaction.ReportDocument).splitId);

    const { account, amount, category, description, issuedAt, product, project, recipient, splitId, transactionId, ...empty } = report;

    expect(transactionId, `[${index}].transactionId`).to.equal(document._id.toString());
    expect(splitId, `[${index}].splitId`).to.equal((document as Transaction.ReportDocument).splitId);
    expect(amount, `[${index}].amount`).to.equal(document.amount);
    expect(description, `[${index}].description`).to.equal(document.description);
    expect(issuedAt, `[${index}].issuedAt`).to.equal(document.issuedAt.toISOString());
    expectEmptyObject(empty, `[${index}]`);

    const documentAccount = document.transactionType === 'deferred' || document.transactionType === 'reimbursement' ? document.ownerAccount : document.account;
    {
      const { accountId, currency, fullName, ...empty } = account;
      expect(accountId, `[${index}].account.accountId`).to.equal(getAccountId(documentAccount));
      expect(currency, `[${index}].account.currency`).to.equal(documentAccount.currency);
      expect(fullName, `[${index}].account.name`).to.equal(`${documentAccount.name} (${documentAccount.owner})`);
      expectEmptyObject(empty, `[${index}].account`);
    }

    if (category) {
      const { categoryId, fullName, ...empty } = category;
      expect(categoryId, `[${index}].category.categoryId`).to.equal(getCategoryId(document.category));
      expect(fullName, `[${index}].category.fullName`).to.equal(document.category?.fullName);
      expectEmptyObject(empty, `[${index}]`);
    } else {
      expect(category, `[${index}].category`).to.be.undefined;
    }

    if (product) {
      const { productId, quantity, fullName, ...empty } = product;
      expect(quantity, `[${index}].product.quantity`).to.equal(document.quantity);
      expect(productId, `[${index}].product.productId`).to.equal(getProductId(document.product));
      expect(fullName, `[${index}].product.fullName`).to.equal(document.product?.fullName);
      expectEmptyObject(empty, `[${index}]`);
    } else {
      expect(product, `[${index}].product`).to.be.undefined;
    }

    if (project) {
      const { name, projectId, ...empty } = project;
      expect(projectId, `[${index}].project.projectId`).to.equal(getProjectId(document.project));
      expect(name, `[${index}].project.name`).to.equal(document.project?.name);
      expectEmptyObject(empty, `[${index}]`);
    }else {
      expect(project, `[${index}].project`).to.be.undefined;
    }

    if (recipient) {
      const { name, recipientId, ...empty } = recipient;
      expect(recipientId, `[${index}].recipient.recipientId`).to.equal(getRecipientId(document.recipient));
      expect(name, `[${index}].recipient.name`).to.equal(document.recipient?.name);
      expectEmptyObject(empty, `[${index}]`);
    }else {
      expect(recipient, `[${index}].recipient`).to.be.undefined;
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
      expectRemainingProperties(internal);
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
        const { amount, billingEndDate, billingStartDate, category, description, invoiceNumber, product, project, quantity, _id, ...empty } = split;
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

        expectEmptyObject(empty, `splits.[${index}]`);
      });

      deferredSplits?.forEach((split, index) => {
        const { amount, billingEndDate, billingStartDate, category, description, invoiceNumber, product, project, quantity, ownerAccount, payingAccount, transactionType, isSettled, _id, ...empty } = split;
        const originalSplitItem = originalDocument.deferredSplits.find(s => s._id.toString() === _id.toString());

        expect(getTransactionId(split), `deferredSplits.[${index}].id`).to.equal(getTransactionId(originalSplitItem));
        expect(amount, `deferredSplits.[${index}].amount`).to.equal(originalSplitItem.amount);
        expect(isSettled, `deferredSplits.[${index}].isSettled`).to.equal(originalSplitItem.isSettled);
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

        expectEmptyObject(empty, `deferredSplits.[${index}]`);
      });
      expectRemainingProperties(internal);
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
        expectRemainingProperties(internal);
      });

      deferredSplits?.forEach((split, index) => {
        const { amount, billingEndDate, billingStartDate, category, description, invoiceNumber, product, project, quantity, _id, ownerAccount, payingAccount, transactionType, isSettled, ...internal } = split;
        expect(getTransactionId(split), `deferredSplits.[${index}].id`).to.equal(getTransactionId(originalDocument.deferredSplits[index]));
        expect(amount, `deferredSplits.[${index}].amount`).to.equal(originalDocument.deferredSplits[index].amount);
        expect(isSettled, `deferredSplits.[${index}].isSettled`).to.equal(originalDocument.deferredSplits[index].isSettled ?? false);
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
        expectRemainingProperties(internal);
      });

      expectRemainingProperties(internal);
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
      expectRemainingProperties(internal);
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
      const { recipient, project, category, quantity, product, invoiceNumber, billingEndDate, billingStartDate, payingAccount, ownerAccount, amount, description, issuedAt, transactionType, isSettled, ...internal } = currentDocument;

      expect(getTransactionId(currentDocument), 'id').to.equal(getTransactionId(originalDocument));
      expect(amount, 'amount').to.equal(originalDocument.amount);
      expect(isSettled, 'isSettled').to.equal(originalDocument.isSettled ?? false);
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
      expectRemainingProperties(internal);
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
      expectRemainingProperties(internal);
    });
};

export const setTransactionValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateTransactionPaymentDocument,
    validateTransactionDeferredDocument,
    validateTransactionReimbursementDocument,
    validateTransactionTransferDocument,
    validateTransactionLoanTransferDocument,
    validateTransactionSplitDocument,
    validateTransactionPaymentResponse,
    validateTransactionDeferredResponse,
    validateTransactionReimbursementResponse,
    validateTransactionTransferResponse,
    validateTransactionLoanTransferResponse,
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
      validateTransactionDeferredDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionDeferredDocument>;
      validateTransactionReimbursementDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionReimbursementDocument>;
      validateTransactionPaymentDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionPaymentDocument>;
      validateTransactionTransferDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionTransferDocument>;
      validateTransactionLoanTransferDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionLoanTransferDocument>;
      validateTransactionSplitDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionSplitDocument>;
      validateTransactionPaymentResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionPaymentResponse>;
      validateTransactionDeferredResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionDeferredResponse>;
      validateTransactionReimbursementResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionReimbursementResponse>;
      validateTransactionTransferResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionTransferResponse>;
      validateTransactionLoanTransferResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionLoanTransferResponse>;
      validateTransactionSplitResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionSplitResponse>;
      validateTransactionListResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionListResponse>;
      validateTransactionListReport: CommandFunctionWithPreviousSubject<typeof validateTransactionListReport>;
    }
  }
}
