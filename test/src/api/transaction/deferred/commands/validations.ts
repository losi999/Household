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
        expect(getProductId(product), 'productId').to.equal(request.productId);
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

export const validateTransactionDeferredResponse = (response: Transaction.DeferredResponse, document: Transaction.DeferredDocument, paymentAmount?: number) => {
  const { transactionId, amount, issuedAt, transactionType, description, payingAccount, ownerAccount, project, product, recipient, category, billingEndDate, billingStartDate, invoiceNumber, quantity, remainingAmount, isSettled, ...empty } = response;

  const expectedRemainingAmount = Math.abs(document.amount) - (paymentAmount ?? 0);

  validateCommonResponse({
    amount,
    description,
    issuedAt,
    transactionId,
    transactionType,
  }, document);
  expect(isSettled, 'isSettled').to.equal(document.isSettled ?? false);
  expect(remainingAmount, 'remainingAmount').to.equal(document.isSettled ? undefined : expectedRemainingAmount);

  cy.validateTransactionNestedObject('payingAccount.', payingAccount).validateLeanAccountResponse(document.payingAccount);
  cy.validateTransactionNestedObject('ownerAccount.', ownerAccount).validateLeanAccountResponse(document.ownerAccount);

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

export const setDeferredTransactionValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateTransactionDeferredDocument,
    validateTransactionDeferredResponse,
  });

  Cypress.Commands.addAll({
    validateRelatedChangesInDeferredDocument,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateRelatedChangesInDeferredDocument: CommandFunction<typeof validateRelatedChangesInDeferredDocument>;
    }

    interface ChainableResponseBody extends Chainable {
      validateTransactionDeferredDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionDeferredDocument>;
      validateTransactionDeferredResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionDeferredResponse>;
    }
  }
}
