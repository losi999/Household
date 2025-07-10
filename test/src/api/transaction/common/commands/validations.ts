import { Account, Category, Product, Project, Transaction } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { createDate, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { expectEmptyObject } from '@household/test/api/utils';
import { TransactionType } from '@household/shared/enums';
import { validateTransactionDeferredResponse } from '@household/test/api/transaction/deferred/commands/validations';
import { validateTransactionPaymentResponse } from '@household/test/api/transaction/payment/commands/validations';
import { validateTransactionReimbursementResponse } from '@household/test/api/transaction/reimbursement/commands/validations';
import { validateTransactionSplitResponse } from '@household/test/api/transaction/split/commands/validations';
import { validateTransactionTransferResponse } from '@household/test/api/transaction/transfer/commands/validations';

export const validateInventoryResponse = (response: Transaction.Quantity & Transaction.Product<Product.Response>, document: Transaction.Quantity & Transaction.Product<Product.Document>, nestedPath: string = '') => {
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

export const validateInvoiceResponse = (response: Transaction.InvoiceDate<string> & Transaction.InvoiceNumber, document: Transaction.InvoiceNumber & Transaction.InvoiceDate<Date>, nestedPath: string = '') => {
  const { billingEndDate, billingStartDate, invoiceNumber } = response;
  expect(invoiceNumber, `${nestedPath}invoiceNumber`).to.equal(document.invoiceNumber);
  expect(createDate(billingStartDate)?.toISOString(), `${nestedPath}billingStartDate`).to.equal(document.billingStartDate?.toISOString());
  expect(createDate(billingEndDate)?.toISOString(), `${nestedPath}billingEndDate`).to.equal(document.billingEndDate?.toISOString());
};

export const validateCommonResponse = (response: Transaction.TransactionId & Transaction.Amount & Transaction.IssuedAt<string> & Transaction.TransactionType<TransactionType> & Transaction.Description, document: Transaction.Document) => {
  const { amount, description, issuedAt, transactionId, transactionType } = response;

  expect(transactionId, 'transactionId').to.equal(getTransactionId(document));
  expect(amount, 'amount').to.equal(document.amount);
  expect(createDate(issuedAt).toISOString(), 'issuedAt').to.equal(document.issuedAt.toISOString());
  expect(transactionType, 'transactionType').to.equal(document.transactionType);
  expect(description, 'description').to.equal(document.description);
};

const validateTransactionListResponse = (responses: Transaction.Response[], documents: Transaction.Document[], viewingAccountId: Account.Id, repayments: Record<Transaction.Id, number>) => {
  expect(responses.length, 'number of items').to.equal(documents.length);
  documents.forEach((document) => {
    const response = responses.find(r => r.transactionId === getTransactionId(document));
    switch(response.transactionType) {
      case 'payment': validateTransactionPaymentResponse(response, document as Transaction.PaymentDocument); break;
      case 'transfer': validateTransactionTransferResponse(response, document as Transaction.TransferDocument, viewingAccountId); break;
      case 'split': validateTransactionSplitResponse(response, document as Transaction.SplitDocument, repayments); break;
      case 'deferred': validateTransactionDeferredResponse(response, document as Transaction.DeferredDocument, repayments[response.transactionId]); break;
      case 'reimbursement': validateTransactionReimbursementResponse(response, document as Transaction.ReimbursementDocument); break;
    }
  });
};

const validateTransactionListReport = (reports: Transaction.Report[], documents: (Transaction.PaymentDocument | Transaction.DeferredDocument | Transaction.ReimbursementDocument | (Transaction.SplitDocument & {split?: Transaction.SplitDocumentItem; deferredSplit?: Transaction.DeferredDocument}))[]) => {
  const total = documents?.length ?? 0;
  expect(reports.length, 'number of items').to.equal(total);
  reports.forEach((report, index) => {
    const { account, amount, category, description, issuedAt, product, project, quantity, recipient, transactionId, invoiceNumber, billingEndDate, billingStartDate, ...empty } = report;
    const document = documents.find(d => {
      if (report.transactionId !== getTransactionId(d)) {
        return false;
      }

      if (d.transactionType === 'split') {
        return d.split?.description === description || d.deferredSplit?.description === description;
      }
      return true;
    });

    let documentCategory: Category.Document;
    let documentProduct: Product.Document;
    let documentProject: Project.Document;
    let documentAccount: Account.Document;
    let documentQuantity: number;
    let documentAmount: number;
    let documentDescription: string;
    let documentInvoiceNumber: string;
    let documentBillingStartDate: string;
    let documentBillingEndDate: string;
    if (document.transactionType === 'split') {
      const split = document.split ?? document.deferredSplit;
      documentCategory = split.category;
      documentProduct = split.product;
      documentProject = split.project;
      documentQuantity = split.quantity;
      documentAmount = split.amount;
      documentDescription = split.description;
      documentInvoiceNumber = split.invoiceNumber;
      documentBillingEndDate = split.billingEndDate?.toISOString().split('T')[0];
      documentBillingStartDate = split.billingStartDate?.toISOString().split('T')[0];
      documentAccount = document.deferredSplit?.ownerAccount ?? document.account;
    } else {
      documentCategory = document.category;
      documentProduct = document.product;
      documentProject = document.project;
      documentQuantity = document.quantity;
      documentAmount = document.amount;
      documentDescription = document.description;
      documentInvoiceNumber = document.invoiceNumber;
      documentBillingEndDate = document.billingEndDate?.toISOString().split('T')[0];
      documentBillingStartDate = document.billingStartDate?.toISOString().split('T')[0];
      documentAccount = document.transactionType === 'payment' ? document.account : document.ownerAccount;
    }

    expect(transactionId, `[${index}].transactionId`).to.equal(getTransactionId(document));
    expect(amount, `[${index}].amount`).to.equal(documentAmount);
    expect(description, `[${index}].description`).to.equal(documentDescription);
    expect(invoiceNumber, `[${index}].invoiceNumber`).to.equal(documentInvoiceNumber);
    expect(billingEndDate, `[${index}].billingEndDate`).to.equal(documentBillingEndDate);
    expect(billingStartDate, `[${index}].billingStartDate`).to.equal(documentBillingStartDate);
    expect(issuedAt, `[${index}].issuedAt`).to.equal(document.issuedAt.toISOString());
    expectEmptyObject(empty, `[${index}]`);

    {
      const { accountId, currency, fullName, ...empty } = account;
      expect(accountId, `[${index}].account.accountId`).to.equal(getAccountId(documentAccount));
      expect(currency, `[${index}].account.currency`).to.equal(documentAccount.currency);
      expect(fullName, `[${index}].account.name`).to.equal(`${documentAccount.name} (${documentAccount.owner})`);
      expectEmptyObject(empty, `[${index}].account`);
    }

    if (category) {
      const { categoryId, fullName, ...empty } = category;
      expect(categoryId, `[${index}].category.categoryId`).to.equal(getCategoryId(documentCategory));
      expect(fullName, `[${index}].category.fullName`).to.equal(documentCategory?.name);
      expectEmptyObject(empty, `[${index}]`);
    } else {
      expect(category, `[${index}].category`).to.be.undefined;
    }

    if (product) {
      const { productId, fullName, ...empty } = product;
      expect(quantity, `[${index}].quantity`).to.equal(documentQuantity);
      expect(productId, `[${index}].product.productId`).to.equal(getProductId(documentProduct));
      expect(fullName, `[${index}].product.fullName`).to.equal(documentProduct?.fullName);
      expectEmptyObject(empty, `[${index}]`);
    } else {
      expect(product, `[${index}].product`).to.be.undefined;
    }

    if (project) {
      const { name, projectId, ...empty } = project;
      expect(projectId, `[${index}].project.projectId`).to.equal(getProjectId(documentProject));
      expect(name, `[${index}].project.name`).to.equal(documentProject?.name);
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

const validateTransactionNestedObject = (nestedPath: string, object: unknown): Cypress.ChainableResponseBody => {
  return cy.log(`Validating ${nestedPath}`).wrap(object, {
    log: false,
  }) as Cypress.ChainableResponseBody;
};

export const setCommonTransactionValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateTransactionListResponse,
    validateTransactionListReport,
  });

  Cypress.Commands.addAll({
    validateTransactionDeleted,
    validateTransactionNestedObject,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateTransactionDeleted: CommandFunction<typeof validateTransactionDeleted>;
      validateTransactionNestedObject: CommandFunction<typeof validateTransactionNestedObject>;
    }

    interface ChainableResponseBody extends Chainable {
      validateTransactionListResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionListResponse>;
      validateTransactionListReport: CommandFunctionWithPreviousSubject<typeof validateTransactionListReport>;
    }
  }
}
