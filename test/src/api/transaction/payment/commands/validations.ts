import { Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { createDate, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';
import { CategoryType } from '@household/shared/enums';
import { validateCommonResponse, validateInventoryResponse, validateInvoiceResponse } from '@household/test/api/transaction/common/commands/validations';

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
      if (category) {
        expect(getCategoryId(category), 'category').to.equal(request.categoryId);
      } else {
        expect(category, 'category').to.be.undefined;
      }
      if (project) {
        expect(getProjectId(project), 'project').to.equal(request.projectId);
      } else {
        expect(project, 'project').to.be.undefined;
      }
      if (recipient) {
        expect(getRecipientId(recipient), 'recipient').to.equal(request.recipientId);
      } else {
        expect(recipient, 'recipient').to.be.undefined;
      }

      if (category?.categoryType === CategoryType.Inventory) {
        expect(quantity, 'quantity').to.equal(request.quantity);
        if (product) {
          expect(getProductId(product), 'productId').to.equal(request.productId);
        } else {
          expect(product, 'product').to.be.undefined;
        }
      } else {
        expect(quantity, 'quantity').to.be.undefined;
        expect(product, 'product').to.be.undefined;
      }

      if (category?.categoryType === CategoryType.Invoice) {
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

export const validateTransactionPaymentResponse = (response: Transaction.PaymentResponse, document: Transaction.PaymentDocument) => {
  const { transactionId, amount, issuedAt, transactionType, description, account, project, product, recipient, category, billingEndDate, billingStartDate, invoiceNumber, quantity, ...empty } = response;

  validateCommonResponse({
    amount,
    description,
    issuedAt,
    transactionId,
    transactionType,
  }, document);

  cy.validateTransactionNestedObject('account', account).validateAccountResponse(document.account);

  if (project) {
    cy.validateTransactionNestedObject('project', project).validateProjectResponse(document.project);
  } else {
    expect(project, 'project').to.be.undefined;
  }

  if (recipient) {
    cy.validateTransactionNestedObject('recipient', recipient).validateRecipientResponse(document.recipient);
  } else {
    expect(recipient, 'recipient').to.be.undefined;
  }

  if (category) {
    cy.validateNestedCategoryResponse('category.', category, document.category);
  } else {
    expect(category, 'category').to.be.undefined;
  }

  if (category?.categoryType === CategoryType.Inventory && product) {
    validateInventoryResponse({
      product,
      quantity,
    }, document);
  } else {
    expect(quantity, 'quantity').to.be.undefined;
    expect(product, 'product').to.be.undefined;
  }

  if (category?.categoryType === CategoryType.Invoice) {
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

export const setPaymentTransactionValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateTransactionPaymentDocument,
    validateTransactionPaymentResponse,
  });

  Cypress.Commands.addAll({
    validateConvertedToPaymentDocument,
    validateRelatedChangesInPaymentDocument,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateConvertedToPaymentDocument: CommandFunction<typeof validateConvertedToPaymentDocument>;
      validateRelatedChangesInPaymentDocument: CommandFunction<typeof validateRelatedChangesInPaymentDocument>;
    }

    interface ChainableResponseBody extends Chainable {
      validateTransactionPaymentDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionPaymentDocument>;
      validateTransactionPaymentResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionPaymentResponse>;
    }
  }
}
