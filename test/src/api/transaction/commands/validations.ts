import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
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
      const { amount, issuedAt, transactionType, description, payingAccount, ownerAccount, category, project, recipient, quantity, product, invoiceNumber, billingEndDate, billingStartDate, ...internal } = document;

      expect(amount, 'amount').to.equal(request.amount);
      expect(issuedAt.toISOString(), 'issuedAt').to.equal(createDate(request.issuedAt).toISOString());
      expect(transactionType, 'transactionType').to.equal('deferred');
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
        const { amount, description, project, product, category, quantity, billingEndDate, billingStartDate, invoiceNumber, payingAccount, ownerAccount, transactionType, ...internal } = split;
        const splitRequestItem = deferredsplitRequests[index];

        expect(amount, `deferredSplits[${index}].amount`).to.equal(splitRequestItem.amount);
        expect(description, `deferredSplits[${index}].description`).to.equal(splitRequestItem.description);
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

const validateTransactionPaymentResponse = (response: Transaction.PaymentResponse, document: Transaction.PaymentDocument) => {
  const { transactionId, amount, issuedAt, transactionType, description, account, project, product, recipient, category, billingEndDate, billingStartDate, invoiceNumber, quantity, ...empty } = response;

  expect(transactionId).to.equal(getTransactionId(document));
  expect(amount, 'amount').to.equal(document.amount);
  expect(createDate(issuedAt).toISOString(), 'issuedAt').to.equal(document.issuedAt.toISOString());
  expect(transactionType, 'transactionType').to.equal('payment');
  expect(description, 'description').to.equal(document.description);

  {
    const { accountId, accountType, balance, currency, fullName, isOpen, loanBalance, name, owner, ...empty } = account;
    expect(accountId, 'account.accountId').to.equal(getAccountId(document.account));
    expect(accountType, 'account.accountType').to.equal(document.account.accountType);
    expect(balance, 'account.balance').to.equal(document.account.balance ?? null);
    expect(loanBalance, 'account.loanBalance').to.equal(document.account.loanBalance ?? null);
    expect(currency, 'account.currency').to.equal(document.account.currency);
    expect(isOpen, 'account.isOpen').to.equal(document.account.isOpen);
    expect(name, 'account.name').to.equal(document.account.name);
    expect(owner, 'account.owner').to.equal(document.account.owner);
    expect(fullName, 'account.fullName').to.equal(`${document.account.name} (${document.account.owner})`);
    expectEmptyObject(empty);
  }

  if (project) {
    const { projectId, name, description, ...empty } = project;
    expect(projectId, 'project.projectId').to.equal(getProjectId(document.project));
    expect(name, 'project.name').to.equal(document.project.name);
    expect(description, 'project.description').to.equal(document.project.description);
    expectEmptyObject(empty);
  } else {
    expect(project, 'project').to.be.undefined;
  }

  if (recipient) {
    const { recipientId, name, ...empty } = recipient;
    expect(recipientId, 'recipient.recipientId').to.equal(getRecipientId(document.recipient));
    expect(name, 'recipient.name').to.equal(document.recipient.name);
    expectEmptyObject(empty);
  } else {
    expect(recipient, 'recipient').to.be.undefined;
  }

  if (category) {
    const { categoryId, name, categoryType, fullName, ...empty } = category;
    expect(categoryId, 'category.categoryId').to.equal(getCategoryId(document.category));
    expect(categoryType, 'category.categoryType').to.equal(document.category.categoryType);
    expect(fullName, 'category.fullName').to.equal(document.category.fullName);
    expect(name, 'category.name').to.equal(document.category.name);
    expectEmptyObject(empty);
  } else {
    expect(category, 'category').to.be.undefined;
  }

  if (category?.categoryType === 'inventory' && product) {
    const { productId, brand, measurement, unitOfMeasurement, fullName, ...empty } = product;

    expect(quantity, 'quantity').to.equal(document.quantity);
    expect(productId, 'product.productId').to.equal(getProductId(document.product));
    expect(brand, 'product.brand').to.equal(document.product.brand);
    expect(measurement, 'product.measurement').to.equal(document.product.measurement);
    expect(unitOfMeasurement, 'product.unitOfMeasurement').to.equal(document.product.unitOfMeasurement);
    expect(fullName, 'product.fullName').to.equal(document.product.fullName);
    expectEmptyObject(empty);
  } else {
    expect(quantity, 'quantity').to.be.undefined;
    expect(product, 'product').to.be.undefined;
  }

  if (category?.categoryType === 'invoice') {
    expect(invoiceNumber, 'invoiceNumber').to.equal(document.invoiceNumber);
    expect(createDate(billingStartDate)?.toISOString(), 'billingStartDate').to.equal(document.billingStartDate?.toISOString());
    expect(createDate(billingEndDate)?.toISOString(), 'billingEndDate').to.equal(document.billingEndDate?.toISOString());
  } else {
    expect(invoiceNumber, 'invoiceNumber').to.be.undefined;
    expect(billingStartDate, 'billingStartDate').to.be.undefined;
    expect(billingEndDate, 'billingEndDate').to.be.undefined;
  }
  expectEmptyObject(empty);
};

const validateTransactionDeferredResponse = (response: Transaction.DeferredResponse, document: Transaction.DeferredDocument, viewingAccountId: Account.Id, paymentAmount?: number) => {
  const { transactionId, amount, issuedAt, transactionType, description, payingAccount, ownerAccount, project, product, recipient, category, billingEndDate, billingStartDate, invoiceNumber, quantity, remainingAmount, ...empty } = response;

  expect(transactionId).to.equal(getTransactionId(document));
  expect(amount, 'amount').to.equal(document.amount);
  expect(createDate(issuedAt).toISOString(), 'issuedAt').to.equal(document.issuedAt.toISOString());
  expect(transactionType, 'transactionType').to.equal('deferred');
  expect(description, 'description').to.equal(document.description);
  expect(remainingAmount, 'remainingAmount').to.equal(viewingAccountId === ownerAccount.accountId ? Math.abs(document.amount) - (paymentAmount ?? 0) : (Math.abs(document.amount) - (paymentAmount ?? 0)) * -1);

  {
    const { accountId, accountType, balance, currency, fullName, isOpen, loanBalance, name, owner, ...empty } = payingAccount;
    expect(accountId, 'payingAccount.accountId').to.equal(getAccountId(document.payingAccount));
    expect(accountType, 'payingAccount.accountType').to.equal(document.payingAccount.accountType);
    expect(balance, 'payingAccount.balance').to.equal(document.payingAccount.balance ?? null);
    expect(loanBalance, 'payingAccount.loanBalance').to.equal(document.payingAccount.loanBalance ?? null);
    expect(currency, 'payingAccount.currency').to.equal(document.payingAccount.currency);
    expect(isOpen, 'payingAccount.isOpen').to.equal(document.payingAccount.isOpen);
    expect(name, 'payingAccount.name').to.equal(document.payingAccount.name);
    expect(owner, 'payingAccount.owner').to.equal(document.payingAccount.owner);
    expect(fullName, 'payingAccount.fullName').to.equal(`${document.payingAccount.name} (${document.payingAccount.owner})`);
    expectEmptyObject(empty);
  }

  {
    const { accountId, accountType, balance, currency, fullName, isOpen, loanBalance, name, owner, ...empty } = ownerAccount;
    expect(accountId, 'ownerAccount.accountId').to.equal(getAccountId(document.ownerAccount));
    expect(accountType, 'ownerAccount.accountType').to.equal(document.ownerAccount.accountType);
    expect(balance, 'ownerAccount.balance').to.equal(document.ownerAccount.balance ?? null);
    expect(loanBalance, 'ownerAccount.loanBalance').to.equal(document.ownerAccount.loanBalance ?? null);
    expect(currency, 'ownerAccount.currency').to.equal(document.ownerAccount.currency);
    expect(isOpen, 'ownerAccount.isOpen').to.equal(document.ownerAccount.isOpen);
    expect(name, 'ownerAccount.name').to.equal(document.ownerAccount.name);
    expect(owner, 'ownerAccount.owner').to.equal(document.ownerAccount.owner);
    expect(fullName, 'ownerAccount.fullName').to.equal(`${document.ownerAccount.name} (${document.ownerAccount.owner})`);
    expectEmptyObject(empty);
  }

  if (project) {
    const { projectId, name, description, ...empty } = project;
    expect(projectId, 'project.projectId').to.equal(getProjectId(document.project));
    expect(name, 'project.name').to.equal(document.project.name);
    expect(description, 'project.description').to.equal(document.project.description);
    expectEmptyObject(empty);
  } else {
    expect(project, 'project').to.be.undefined;
  }

  if (recipient) {
    const { recipientId, name, ...empty } = recipient;
    expect(recipientId, 'recipient.recipientId').to.equal(getRecipientId(document.recipient));
    expect(name, 'recipient.name').to.equal(document.recipient.name);
    expectEmptyObject(empty);
  } else {
    expect(recipient, 'recipient').to.be.undefined;
  }

  if (category) {
    const { categoryId, name, categoryType, fullName, ...empty } = category;
    expect(categoryId, 'category.categoryId').to.equal(getCategoryId(document.category));
    expect(categoryType, 'category.categoryType').to.equal(document.category.categoryType);
    expect(fullName, 'category.fullName').to.equal(document.category.fullName);
    expect(name, 'category.name').to.equal(document.category.name);
    expectEmptyObject(empty);
  } else {
    expect(category, 'category').to.be.undefined;
  }

  if (category?.categoryType === 'inventory' && product) {
    const { productId, brand, measurement, unitOfMeasurement, fullName, ...empty } = product;

    expect(quantity, 'quantity').to.equal(document.quantity);
    expect(productId, 'product.productId').to.equal(getProductId(document.product));
    expect(brand, 'product.brand').to.equal(document.product.brand);
    expect(measurement, 'product.measurement').to.equal(document.product.measurement);
    expect(unitOfMeasurement, 'product.unitOfMeasurement').to.equal(document.product.unitOfMeasurement);
    expect(fullName, 'product.fullName').to.equal(document.product.fullName);
    expectEmptyObject(empty);
  } else {
    expect(quantity, 'quantity').to.be.undefined;
    expect(product, 'product').to.be.undefined;
  }

  if (category?.categoryType === 'invoice') {
    expect(invoiceNumber, 'invoiceNumber').to.equal(document.invoiceNumber);
    expect(createDate(billingStartDate)?.toISOString(), 'billingStartDate').to.equal(document.billingStartDate?.toISOString());
    expect(createDate(billingEndDate)?.toISOString(), 'billingEndDate').to.equal(document.billingEndDate?.toISOString());
  } else {
    expect(invoiceNumber, 'invoiceNumber').to.be.undefined;
    expect(billingStartDate, 'billingStartDate').to.be.undefined;
    expect(billingEndDate, 'billingEndDate').to.be.undefined;
  }
  expectEmptyObject(empty);
};

const validateTransactionReimbursementResponse = (response: Transaction.ReimbursementResponse, document: Transaction.ReimbursementDocument) => {
  const { transactionId, amount, issuedAt, transactionType, description, payingAccount, ownerAccount, project, product, recipient, category, billingEndDate, billingStartDate, invoiceNumber, quantity, ...empty } = response;

  expect(response.transactionId).to.equal(getTransactionId(document));
  expect(response.amount, 'amount').to.equal(document.amount);
  expect(createDate(response.issuedAt).toISOString(), 'issuedAt').to.equal(document.issuedAt.toISOString());
  expect(response.transactionType, 'transactionType').to.equal('reimbursement');
  expect(response.description, 'description').to.equal(document.description);

  {
    const { accountId, accountType, balance, currency, fullName, isOpen, loanBalance, name, owner, ...empty } = payingAccount;
    expect(accountId, 'payingAccount.accountId').to.equal(getAccountId(document.payingAccount));
    expect(accountType, 'payingAccount.accountType').to.equal(document.payingAccount.accountType);
    expect(balance, 'payingAccount.balance').to.equal(document.payingAccount.balance ?? null);
    expect(loanBalance, 'payingAccount.loanBalance').to.equal(document.payingAccount.loanBalance ?? null);
    expect(currency, 'payingAccount.currency').to.equal(document.payingAccount.currency);
    expect(isOpen, 'payingAccount.isOpen').to.equal(document.payingAccount.isOpen);
    expect(name, 'payingAccount.name').to.equal(document.payingAccount.name);
    expect(owner, 'payingAccount.owner').to.equal(document.payingAccount.owner);
    expect(fullName, 'payingAccount.fullName').to.equal(`${document.payingAccount.name} (${document.payingAccount.owner})`);
    expectEmptyObject(empty);
  }

  {
    const { accountId, accountType, balance, currency, fullName, isOpen, loanBalance, name, owner, ...empty } = ownerAccount;
    expect(accountId, 'ownerAccount.accountId').to.equal(getAccountId(document.ownerAccount));
    expect(accountType, 'ownerAccount.accountType').to.equal(document.ownerAccount.accountType);
    expect(balance, 'ownerAccount.balance').to.equal(document.ownerAccount.balance ?? null);
    expect(loanBalance, 'ownerAccount.loanBalance').to.equal(document.ownerAccount.loanBalance ?? null);
    expect(currency, 'ownerAccount.currency').to.equal(document.ownerAccount.currency);
    expect(isOpen, 'ownerAccount.isOpen').to.equal(document.ownerAccount.isOpen);
    expect(name, 'ownerAccount.name').to.equal(document.ownerAccount.name);
    expect(owner, 'ownerAccount.owner').to.equal(document.ownerAccount.owner);
    expect(fullName, 'ownerAccount.fullName').to.equal(`${document.ownerAccount.name} (${document.ownerAccount.owner})`);
    expectEmptyObject(empty);
  }

  if (project) {
    const { projectId, name, description, ...empty } = project;
    expect(projectId, 'project.projectId').to.equal(getProjectId(document.project));
    expect(name, 'project.name').to.equal(document.project.name);
    expect(description, 'project.description').to.equal(document.project.description);
    expectEmptyObject(empty);
  } else {
    expect(project, 'project').to.be.undefined;
  }

  if (recipient) {
    const { recipientId, name, ...empty } = recipient;
    expect(recipientId, 'recipient.recipientId').to.equal(getRecipientId(document.recipient));
    expect(name, 'recipient.name').to.equal(document.recipient.name);
    expectEmptyObject(empty);
  } else {
    expect(recipient, 'recipient').to.be.undefined;
  }

  if (category) {
    const { categoryId, name, categoryType, fullName, ...empty } = category;
    expect(categoryId, 'category.categoryId').to.equal(getCategoryId(document.category));
    expect(categoryType, 'category.categoryType').to.equal(document.category.categoryType);
    expect(fullName, 'category.fullName').to.equal(document.category.fullName);
    expect(name, 'category.name').to.equal(document.category.name);
    expectEmptyObject(empty);
  } else {
    expect(category, 'category').to.be.undefined;
  }

  if (category?.categoryType === 'inventory' && product) {
    const { productId, brand, measurement, unitOfMeasurement, fullName, ...empty } = product;

    expect(quantity, 'quantity').to.equal(document.quantity);
    expect(productId, 'product.productId').to.equal(getProductId(document.product));
    expect(brand, 'product.brand').to.equal(document.product.brand);
    expect(measurement, 'product.measurement').to.equal(document.product.measurement);
    expect(unitOfMeasurement, 'product.unitOfMeasurement').to.equal(document.product.unitOfMeasurement);
    expect(fullName, 'product.fullName').to.equal(document.product.fullName);
    expectEmptyObject(empty);
  } else {
    expect(quantity, 'quantity').to.be.undefined;
    expect(product, 'product').to.be.undefined;
  }

  if (category?.categoryType === 'invoice') {
    expect(invoiceNumber, 'invoiceNumber').to.equal(document.invoiceNumber);
    expect(createDate(billingStartDate)?.toISOString(), 'billingStartDate').to.equal(document.billingStartDate?.toISOString());
    expect(createDate(billingEndDate)?.toISOString(), 'billingEndDate').to.equal(document.billingEndDate?.toISOString());
  } else {
    expect(invoiceNumber, 'invoiceNumber').to.be.undefined;
    expect(billingStartDate, 'billingStartDate').to.be.undefined;
    expect(billingEndDate, 'billingEndDate').to.be.undefined;
  }
  expectEmptyObject(empty);
};

const validateTransactionTransferResponse = (response: Transaction.TransferResponse, document: Transaction.TransferDocument, viewingAccountId: Account.Id) => {
  const documentAmount = getAccountId(document.account) === viewingAccountId ? document.amount : document.transferAmount;
  const documentAccount = getAccountId(document.account) === viewingAccountId ? document.account : document.transferAccount;
  const documentTransferAmount = getAccountId(document.account) === viewingAccountId ? document.transferAmount : document.amount;
  const documentTransferAccount = getAccountId(document.account) === viewingAccountId ? document.transferAccount : document.account;

  const { transactionId, amount, issuedAt, transactionType, description, account, transferAccount, transferAmount, ...empty } = response;

  expect(transactionId).to.equal(getTransactionId(document));
  expect(amount, 'amount').to.equal(documentAmount);
  expect(transferAmount, 'transferAmount').to.equal(documentTransferAmount);
  expect(createDate(issuedAt).toISOString(), 'issuedAt').to.equal(document.issuedAt.toISOString());
  expect(transactionType, 'transactionType').to.equal('transfer');
  expect(description, 'description').to.equal(document.description);

  {
    const { accountId, accountType, balance, currency, fullName, isOpen, loanBalance, name, owner } = account;
    expect(accountId, 'account.accountId').to.equal(getAccountId(documentAccount));
    expect(accountType, 'account.accountType').to.equal(documentAccount.accountType);
    expect(balance, 'payingAccount.balance').to.equal(documentAccount.balance ?? null);
    expect(loanBalance, 'payingAccount.loanBalance').to.equal(documentAccount.loanBalance ?? null);
    expect(currency, 'account.currency').to.equal(documentAccount.currency);
    expect(isOpen, 'account.isOpen').to.equal(documentAccount.isOpen);
    expect(name, 'account.name').to.equal(documentAccount.name);
    expect(owner, 'payingAccount.owner').to.equal(documentAccount.owner);
    expect(fullName, 'account.fullName').to.equal(`${documentAccount.name} (${documentAccount.owner})`);
    expectEmptyObject(empty);
  }

  {
    const { accountId, accountType, balance, currency, fullName, isOpen, loanBalance, name, owner } = transferAccount;
    expect(accountId, 'transferAccount.accountId').to.equal(getAccountId(documentTransferAccount));
    expect(accountType, 'transferAccount.accountType').to.equal(documentTransferAccount.accountType);
    expect(balance, 'transferAccount.balance').to.equal(documentTransferAccount.balance ?? null);
    expect(loanBalance, 'transferAccount.loanBalance').to.equal(documentTransferAccount.loanBalance ?? null);
    expect(currency, 'transferAccount.currency').to.equal(documentTransferAccount.currency);
    expect(isOpen, 'transferAccount.isOpen').to.equal(documentTransferAccount.isOpen);
    expect(name, 'transferAccount.name').to.equal(documentTransferAccount.name);
    expect(owner, 'transferAccount.owner').to.equal(documentTransferAccount.owner);
    expect(fullName, 'transferAccount.fullName').to.equal(`${documentTransferAccount.name} (${documentTransferAccount.owner})`);
    expectEmptyObject(empty);
  }
  expectEmptyObject(empty);

};

const validateTransactionLoanTransferResponse = (response: Transaction.LoanTransferResponse, document: Transaction.LoanTransferDocument, viewingAccountId: Account.Id) => {
  const documentAccount = getAccountId(document.account) === viewingAccountId ? document.account : document.transferAccount;
  const documentTransferAccount = getAccountId(document.account) === viewingAccountId ? document.transferAccount : document.account;

  const { transactionId, amount, issuedAt, transactionType, description, account, transferAccount, ...empty } = response;

  expect(transactionId).to.equal(getTransactionId(document));
  expect(amount, 'amount').to.equal(document.amount);
  expect(createDate(issuedAt).toISOString(), 'issuedAt').to.equal(document.issuedAt.toISOString());
  expect(transactionType, 'transactionType').to.equal('loanTransfer');
  expect(description, 'description').to.equal(document.description);

  {
    const { accountId, accountType, balance, currency, fullName, isOpen, loanBalance, name, owner } = account;
    expect(accountId, 'account.accountId').to.equal(getAccountId(documentAccount));
    expect(accountType, 'account.accountType').to.equal(documentAccount.accountType);
    expect(balance, 'payingAccount.balance').to.equal(documentAccount.balance ?? null);
    expect(loanBalance, 'payingAccount.loanBalance').to.equal(documentAccount.loanBalance ?? null);
    expect(currency, 'account.currency').to.equal(documentAccount.currency);
    expect(isOpen, 'account.isOpen').to.equal(documentAccount.isOpen);
    expect(name, 'account.name').to.equal(documentAccount.name);
    expect(owner, 'payingAccount.owner').to.equal(documentAccount.owner);
    expect(fullName, 'account.fullName').to.equal(`${documentAccount.name} (${documentAccount.owner})`);
    expectEmptyObject(empty);
  }

  {
    const { accountId, accountType, balance, currency, fullName, isOpen, loanBalance, name, owner } = transferAccount;
    expect(accountId, 'transferAccount.accountId').to.equal(getAccountId(documentTransferAccount));
    expect(accountType, 'transferAccount.accountType').to.equal(documentTransferAccount.accountType);
    expect(balance, 'transferAccount.balance').to.equal(documentTransferAccount.balance ?? null);
    expect(loanBalance, 'transferAccount.loanBalance').to.equal(documentTransferAccount.loanBalance ?? null);
    expect(currency, 'transferAccount.currency').to.equal(documentTransferAccount.currency);
    expect(isOpen, 'transferAccount.isOpen').to.equal(documentTransferAccount.isOpen);
    expect(name, 'transferAccount.name').to.equal(documentTransferAccount.name);
    expect(owner, 'transferAccount.owner').to.equal(documentTransferAccount.owner);
    expect(fullName, 'transferAccount.fullName').to.equal(`${documentTransferAccount.name} (${documentTransferAccount.owner})`);
    expectEmptyObject(empty);
  }
  expectEmptyObject(empty);
};

const validateTransactionSplitResponse = (response: Transaction.SplitResponse, document: Transaction.SplitDocument, repayments?: Record<Transaction.Id, number>) => {

  const { transactionId, amount, issuedAt, transactionType, description, account, deferredSplits, splits, recipient, ...empty } = response;
  expect(transactionId).to.equal(getTransactionId(document));
  expect(amount, 'amount').to.equal(document.amount);
  expect(createDate(issuedAt).toISOString(), 'issuedAt').to.equal(document.issuedAt.toISOString());
  expect(transactionType, 'transactionType').to.equal('split');
  expect(description, 'description').to.equal(document.description);

  {
    const { accountId, accountType, balance, currency, fullName, isOpen, loanBalance, name, owner, ...empty } = account;
    expect(accountId, 'account.accountId').to.equal(getAccountId(document.account));
    expect(accountType, 'account.accountType').to.equal(document.account.accountType);
    expect(balance, 'account.balance').to.equal(document.account.balance ?? null);
    expect(loanBalance, 'payingAccount.loanBalance').to.equal(document.account.loanBalance ?? null);
    expect(currency, 'account.currency').to.equal(document.account.currency);
    expect(isOpen, 'account.isOpen').to.equal(document.account.isOpen);
    expect(name, 'account.name').to.equal(document.account.name);
    expect(owner, 'payingAccount.owner').to.equal(document.account.owner);
    expect(fullName, 'account.fullName').to.equal(`${document.account.name} (${document.account.owner})`);
    expectEmptyObject(empty);
  }

  if (recipient) {
    const { recipientId, name, ...empty } = recipient;
    expect(recipientId, 'recipient.recipientId').to.equal(getRecipientId(document.recipient));
    expect(name, 'recipient.name').to.equal(document.recipient?.name);
    expectEmptyObject(empty);
  } else {
    expect(recipient, 'recipient').to.be.undefined;
  }

  splits.forEach((split, index) => {
    const documentSplit = document.splits[index];
    const { amount, billingEndDate, billingStartDate, category, description, invoiceNumber, product, project, quantity, ...empty } = split;

    expect(amount, `splits[${index}].amount`).to.equal(documentSplit.amount);
    expect(description, `splits[${index}].description`).to.equal(documentSplit.description);

    if (project) {
      const { projectId, name, description, ...empty } = project;
      expect(projectId, `splits[${index}].project.projectId`).to.equal(getProjectId(documentSplit.project));
      expect(name, `splits[${index}].project.name`).to.equal(documentSplit.project?.name);
      expect(description, `splits[${index}].project.description`).to.equal(documentSplit.project?.description);
      expectEmptyObject(empty);
    } else {
      expect(project, `splits[${index}].project`).to.be.undefined;
    }

    if (category) {
      const { categoryId, name, categoryType, fullName, ...empty } = category;

      expect(categoryId, `splits[${index}].category.categoryId`).to.equal(getCategoryId(documentSplit.category));
      expect(categoryType, `splits[${index}].category.categoryType`).to.equal(documentSplit.category?.categoryType);
      expect(fullName, `splits[${index}].category.fullName`).to.equal(documentSplit.category?.fullName);
      expect(name, `splits[${index}].category.name`).to.equal(documentSplit.category?.name);
      expectEmptyObject(empty);
    } else {
      expect(category, `splits[${index}].category`).to.be.undefined;
    }

    if(category?.categoryType === 'inventory' && product) {
      const { productId, brand, measurement, unitOfMeasurement, fullName, ...empty } = product;

      expect(quantity, `splits[${index}].quantity`).to.equal(documentSplit.quantity);
      expect(productId, `splits[${index}].product.productId`).to.equal(getProductId(documentSplit.product));
      expect(brand, `splits[${index}].product.brand`).to.equal(documentSplit.product?.brand);
      expect(measurement, `splits[${index}].product.measurement`).to.equal(documentSplit.product?.measurement);
      expect(unitOfMeasurement, `splits[${index}].product.unitOfMeasurement`).to.equal(documentSplit.product?.unitOfMeasurement);
      expect(fullName, `splits[${index}].product.fullName`).to.equal(documentSplit.product?.fullName);
      expectEmptyObject(empty);
    } else {
      expect(quantity, `splits[${index}].quantity`).to.be.undefined;
      expect(product, `splits[${index}].product`).to.be.undefined;
    }

    if(category?.categoryType === 'invoice') {
      expect(invoiceNumber, `splits[${index}].invoiceNumber`).to.equal(documentSplit.invoiceNumber);
      expect(createDate(billingStartDate)?.toISOString(), `splits[${index}].billingStartDate`).to.equal(documentSplit.billingStartDate?.toISOString());
      expect(createDate(billingEndDate)?.toISOString(), `splits[${index}].billingEndDate`).to.equal(documentSplit.billingEndDate?.toISOString());
    } else {
      expect(invoiceNumber, `splits[${index}].invoiceNumber`).to.be.undefined;
      expect(billingStartDate, `isplits[${index}].billingStartDate`).to.be.undefined;
      expect(billingEndDate, `splits[${index}].billingEndDate`).to.be.undefined;
    }
    expectEmptyObject(empty);
  });

  deferredSplits.forEach((split, index) => {
    const documentSplit = document.deferredSplits[index];
    const { amount, billingEndDate, billingStartDate, category, description, invoiceNumber, product, project, quantity, ownerAccount, payingAccount, transactionType, remainingAmount, transactionId, ...empty } = split;

    expect(transactionId, `deferredSplits[${index}].transactionId`).to.equal(getTransactionId(documentSplit));
    expect(amount, `deferredSplits[${index}].amount`).to.equal(documentSplit.amount);
    expect(transactionType, `deferredSplits[${index}].transactionType`).to.equal('deferred');
    expect(remainingAmount, `deferredSplits[${index}].remainingAmount`).to.equal(documentSplit.amount + (repayments?.[transactionId] ?? 0));
    expect(description, `deferredSplits[${index}].description`).to.equal(documentSplit.description);

    {
      const { accountId, accountType, balance, currency, fullName, isOpen, loanBalance, name, owner, ...empty } = payingAccount;
      expect(accountId, `deferredSplits[${index}].payingAccount.accountId`).to.equal(getAccountId(documentSplit.payingAccount));
      expect(accountType, `deferredSplits[${index}].payingAccount.accountType`).to.equal(documentSplit.payingAccount.accountType);
      expect(balance, `deferredSplits[${index}].payingAccount.balance`).to.equal(documentSplit.payingAccount.balance ?? null);
      expect(loanBalance, `deferredSplits[${index}].payingAccount.loanBalance`).to.equal(documentSplit.payingAccount.loanBalance ?? null);
      expect(currency, `deferredSplits[${index}].payingAccount.currency`).to.equal(documentSplit.payingAccount.currency);
      expect(isOpen, `deferredSplits[${index}].payingAccount.isOpen`).to.equal(documentSplit.payingAccount.isOpen);
      expect(name, `deferredSplits[${index}].payingAccount.name`).to.equal(documentSplit.payingAccount.name);
      expect(owner, `deferredSplits[${index}].payingAccount.owner`).to.equal(documentSplit.payingAccount.owner);
      expect(fullName, `deferredSplits[${index}].payingAccount.fullName`).to.equal(`${documentSplit.payingAccount.name} (${documentSplit.payingAccount.owner})`);
      expectEmptyObject(empty);
    }

    {
      const { accountId, accountType, balance, currency, fullName, isOpen, loanBalance, name, owner, ...empty } = ownerAccount;
      expect(accountId, `deferredSplits[${index}].ownerAccount.accountId`).to.equal(getAccountId(documentSplit.ownerAccount));
      expect(accountType, `deferredSplits[${index}].ownerAccount.accountType`).to.equal(documentSplit.ownerAccount.accountType);
      expect(balance, `deferredSplits[${index}].ownerAccount.balance`).to.equal(documentSplit.ownerAccount.balance ?? null);
      expect(loanBalance, `deferredSplits[${index}].ownerAccount.loanBalance`).to.equal(documentSplit.ownerAccount.loanBalance ?? null);
      expect(currency, `deferredSplits[${index}].ownerAccount.currency`).to.equal(documentSplit.ownerAccount.currency);
      expect(isOpen, `deferredSplits[${index}].ownerAccount.isOpen`).to.equal(documentSplit.ownerAccount.isOpen);
      expect(name, `deferredSplits[${index}].ownerAccount.name`).to.equal(documentSplit.ownerAccount.name);
      expect(owner, `deferredSplits[${index}].ownerAccount.owner`).to.equal(documentSplit.ownerAccount.owner);
      expect(fullName, `deferredSplits[${index}].ownerAccount.fullName`).to.equal(`${documentSplit.ownerAccount.name} (${documentSplit.ownerAccount.owner})`);
      expectEmptyObject(empty);
    }

    if (project) {
      const { projectId, name, description, ...empty } = project;
      expect(projectId, `deferredSplits[${index}].project.projectId`).to.equal(getProjectId(documentSplit.project));
      expect(name, `deferredSplits[${index}].project.name`).to.equal(documentSplit.project?.name);
      expect(description, `deferredSplits[${index}].project.description`).to.equal(documentSplit.project?.description);
      expectEmptyObject(empty);
    } else {
      expect(project, `deferredSplits[${index}].project`).to.be.undefined;
    }

    if (category) {
      const { categoryId, name, categoryType, fullName, ...empty } = category;

      expect(categoryId, `deferredSplits[${index}].category.categoryId`).to.equal(getCategoryId(documentSplit.category));
      expect(categoryType, `deferredSplits[${index}].category.categoryType`).to.equal(documentSplit.category?.categoryType);
      expect(fullName, `deferredSplits[${index}].category.fullName`).to.equal(documentSplit.category?.fullName);
      expect(name, `deferredSplits[${index}].category.name`).to.equal(documentSplit.category?.name);
      expectEmptyObject(empty);
    } else {
      expect(category, `deferredSplits[${index}].category`).to.be.undefined;
    }

    if (category?.categoryType === 'inventory' && product) {
      const { productId, brand, measurement, unitOfMeasurement, fullName, ...empty } = product;

      expect(quantity, `deferredSplits[${index}].quantity`).to.equal(documentSplit.quantity);
      expect(productId, `deferredSplits[${index}].product.productId`).to.equal(getProductId(documentSplit.product));
      expect(brand, `deferredSplits[${index}].product.brand`).to.equal(documentSplit.product?.brand);
      expect(measurement, `deferredSplits[${index}].product.measurement`).to.equal(documentSplit.product?.measurement);
      expect(unitOfMeasurement, `deferredSplits[${index}].product.unitOfMeasurement`).to.equal(documentSplit.product?.unitOfMeasurement);
      expect(fullName, `deferredSplits[${index}].product.fullName`).to.equal(documentSplit.product?.fullName);
      expectEmptyObject(empty);
    } else {
      expect(quantity, `deferredSplits[${index}].quantity`).to.be.undefined;
      expect(product, `deferredSplits[${index}].product`).to.be.undefined;
    }

    if (category?.categoryType === 'invoice') {
      expect(invoiceNumber, `deferredSplits[${index}].invoiceNumber`).to.equal(documentSplit.invoiceNumber);
      expect(createDate(billingStartDate)?.toISOString(), `deferredSplits[${index}].billingStartDate`).to.equal(documentSplit.billingStartDate?.toISOString());
      expect(createDate(billingEndDate)?.toISOString(), `deferredSplits[${index}].billingEndDate`).to.equal(documentSplit.billingEndDate?.toISOString());
    } else {
      expect(invoiceNumber, `deferredSplits[${index}].invoiceNumber`).to.be.undefined;
      expect(billingStartDate, `ideferredSplits[${index}].billingStartDate`).to.be.undefined;
      expect(billingEndDate, `deferredSplits[${index}].billingEndDate`).to.be.undefined;
    }
    expectEmptyObject(empty);
  });
  expectEmptyObject(empty);
};

const validateTransactionListResponse = (responses: Transaction.Response[], documents: Transaction.Document[], viewingAccountId: Account.Id) => {
  documents.forEach((document) => {
    const response = responses.find(r => r.transactionId === getTransactionId(document));
    switch(response.transactionType) {
      case 'payment': validateTransactionPaymentResponse(response, document as Transaction.PaymentDocument); break;
      case 'transfer': validateTransactionTransferResponse(response, document as Transaction.TransferDocument, viewingAccountId); break;
      case 'split': validateTransactionSplitResponse(response, document as Transaction.SplitDocument); break;
      case 'deferred': validateTransactionDeferredResponse(response, document as Transaction.DeferredDocument, viewingAccountId); break;
      case 'reimbursement': validateTransactionReimbursementResponse(response, document as Transaction.ReimbursementDocument); break;
      case 'loanTransfer': validateTransactionLoanTransferResponse(response, document as Transaction.LoanTransferDocument, viewingAccountId); break;
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

        expectEmptyObject(empty);
      });

      deferredSplits?.forEach((split, index) => {
        const { amount, billingEndDate, billingStartDate, category, description, invoiceNumber, product, project, quantity, ownerAccount, payingAccount, transactionType, _id, ...empty } = split;
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

        expectEmptyObject(empty);
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
