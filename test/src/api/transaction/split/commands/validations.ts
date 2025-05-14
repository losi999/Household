import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { CommandFunction, CommandFunctionWithPreviousSubject } from '@household/test/api/types';
import { createDate, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { expectEmptyObject, expectRemainingProperties } from '@household/test/api/utils';
import { CategoryType } from '@household/shared/enums';
import { validateCommonResponse, validateInventoryResponse, validateInvoiceResponse } from '@household/test/api/transaction/common/commands/validations';

type Reassignment<T> = {
  from: T;
  to?: T;
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
      if (recipient) {
        expect(getRecipientId(recipient), 'recipient').to.equal(request.recipientId);
      } else {
        expect(recipient, 'recipient').to.be.undefined;
      }

      splits?.forEach((split, index) => {
        const { amount, description, project, product, category, quantity, billingEndDate, billingStartDate, invoiceNumber, ...internal } = split;
        const splitRequestItem = request.splits[index];

        expect(amount, `splits[${index}].amount`).to.equal(splitRequestItem.amount);
        expect(description, `splits[${index}].description`).to.equal(splitRequestItem.description);
        if (project) {
          expect(getProjectId(project), `splits[${index}].project`).to.equal(splitRequestItem.projectId);
        } else {
          expect(project, `splits[${index}].project`).to.be.undefined;
        }
        if (category) {
          expect(getCategoryId(category), `splits[${index}].category`).to.equal(splitRequestItem.categoryId);
        } else {
          expect(category, `splits[${index}].category`).to.be.undefined;
        }

        if (category?.categoryType === CategoryType.Inventory) {
          expect(quantity, `splits[${index}].quantity`).to.equal(splitRequestItem.quantity);
          if (product) {
            expect(getProductId(product), `splits[${index}].product`).to.equal(splitRequestItem.productId);
          } else {
            expect(product, `splits[${index}].product`).to.be.undefined;
          }
          expect(getProductId(product), `splits[${index}].productId`).to.equal(splitRequestItem.productId);
        } else {
          expect(quantity, `splits[${index}].quantity`).to.be.undefined;
          expect(product, `splits[${index}].product`).to.be.undefined;
        }

        if (category?.categoryType === CategoryType.Invoice) {
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
        const splitRequestItem = request.loans[index];

        expect(amount, `deferredSplits[${index}].amount`).to.equal(splitRequestItem.amount);
        expect(description, `deferredSplits[${index}].description`).to.equal(splitRequestItem.description);
        expect(isSettled, `deferredSplits[${index}].isSettled`).to.equal(splitRequestItem.isSettled ?? false);
        expect(transactionType, `deferredSplits[${index}].transactionType`).to.equal('deferred');
        if (project) {
          expect(getProjectId(project), `deferredSplits[${index}].project`).to.equal(splitRequestItem.projectId);
        } else {
          expect(project, `deferredSplits[${index}].project`).to.be.undefined;
        }
        if (category) {
          expect(getCategoryId(category), `deferredSplits[${index}].category`).to.equal(splitRequestItem.categoryId);
        } else {
          expect(category, `deferredSplits[${index}].category`).to.be.undefined;
        }

        expect(getProjectId(project), `deferredSplits[${index}].project`).to.equal(splitRequestItem.projectId);
        expect(getCategoryId(category), `deferredSplits[${index}].category`).to.equal(splitRequestItem.categoryId);
        expect(getAccountId(payingAccount), `deferredSplits[${index}].payingAccount`).to.equal(request.accountId);
        expect(getAccountId(ownerAccount), `deferredSplits[${index}].ownerAccount`).to.equal(splitRequestItem.loanAccountId);

        if (category?.categoryType === CategoryType.Inventory) {
          expect(quantity, `deferredSplits[${index}].quantity`).to.equal(splitRequestItem.quantity);
          if (product) {
            expect(getProductId(product), `deferredSplits[${index}].product`).to.equal(splitRequestItem.productId);
          } else {
            expect(product, `deferredSplits[${index}].product`).to.be.undefined;
          }
        } else {
          expect(quantity, `deferredSplits[${index}].quantity`).to.be.undefined;
          expect(product, `deferredSplits[${index}].product`).to.be.undefined;
        }

        if (category?.categoryType === CategoryType.Invoice) {
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

export const validateTransactionSplitResponse = (response: Transaction.SplitResponse, document: Transaction.SplitDocument, repayments?: Record<Transaction.Id, number>) => {

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

    if (category?.categoryType === CategoryType.Inventory && product) {
      validateInventoryResponse({
        product,
        quantity,
      }, documentSplit, `splits[${index}].`);
    } else {
      expect(quantity, `splits[${index}].quantity`).to.be.undefined;
      expect(product, `splits[${index}].product`).to.be.undefined;
    }

    if (category?.categoryType === CategoryType.Invoice) {
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
    expect(remainingAmount, `deferredSplits[${index}].remainingAmount`).to.equal(documentSplit.isSettled ? undefined : (Math.abs(documentSplit.amount) - (repayments?.[transactionId] ?? 0)));
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

    if (category?.categoryType === CategoryType.Inventory && product) {
      validateInventoryResponse({
        product,
        quantity,
      }, documentSplit, `deferredSplits[${index}].`);
    } else {
      expect(quantity, `deferredSplits[${index}].quantity`).to.be.undefined;
      expect(product, `deferredSplits[${index}].product`).to.be.undefined;
    }

    if (category?.categoryType === CategoryType.Invoice) {
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

const validateConvertedToRegularSplitItemDocument = (originalDocument: Transaction.SplitDocument, deletedAccountId: Account.Id) => {
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
        const { amount, billingEndDate, billingStartDate, category, description, invoiceNumber, product, project, quantity, ...empty } = split;
        const originalSplitItem = originalDocument.splits[index] ?? originalDocument.deferredSplits.find(x => getAccountId(x.ownerAccount) === deletedAccountId);

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

export const setSplitTransactionValidationCommands = () => {
  Cypress.Commands.addAll<any>({
    prevSubject: true,
  }, {
    validateTransactionSplitDocument,
    validateTransactionSplitResponse,
  });

  Cypress.Commands.addAll({
    validateConvertedToRegularSplitItemDocument,
    validateRelatedChangesInSplitDocument,
  });
};

declare global {
  namespace Cypress {
    interface Chainable {
      validateConvertedToRegularSplitItemDocument: CommandFunction<typeof validateConvertedToRegularSplitItemDocument>;
      validateRelatedChangesInSplitDocument: CommandFunction<typeof validateRelatedChangesInSplitDocument>;
    }

    interface ChainableResponseBody extends Chainable {
      validateTransactionSplitDocument: CommandFunctionWithPreviousSubject<typeof validateTransactionSplitDocument>;
      validateTransactionSplitResponse: CommandFunctionWithPreviousSubject<typeof validateTransactionSplitResponse>;
    }
  }
}
