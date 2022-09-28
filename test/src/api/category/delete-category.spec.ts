import { createCategoryId } from '@household/shared/common/test-data-factory';
import { getAccountId, getCategoryId, getTransactionId, toDictionary } from '@household/shared/common/utils';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Category, Transaction } from '@household/shared/types/types';

const createRelatedTransactions = (accountDocument: Account.Document, categoryDocument: Category.Document): [Transaction.PaymentDocument, Transaction.SplitDocument] => {
  const paymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
    body: {
      accountId: getAccountId(accountDocument),
      amount: 100,
      description: 'description',
      issuedAt: new Date(2022, 2, 3).toISOString(),
      categoryId: getCategoryId(categoryDocument),
      inventory: undefined,
      invoice: undefined,
      projectId: undefined,
      recipientId: undefined,
    },
    account: accountDocument,
    category: categoryDocument,
    project: undefined,
    recipient: undefined,
    product: undefined,
  }, Cypress.env('EXPIRES_IN'), true);

  const splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
    body: {
      accountId: getAccountId(accountDocument),
      amount: 200,
      description: 'description',
      issuedAt: new Date(2022, 2, 3).toISOString(),
      recipientId: undefined,
      splits: [
        {
          amount: 100,
          categoryId: getCategoryId(categoryDocument),
          description: undefined,
          inventory: undefined,
          invoice: undefined,
          projectId: undefined,
        },
        {
          amount: 100,
          categoryId: undefined,
          description: undefined,
          inventory: undefined,
          invoice: undefined,
          projectId: undefined,
        },
      ],
    },
    account: accountDocument,
    recipient: undefined,
    categories: toDictionary([categoryDocument], '_id'),
    projects: {},
    products: {},
  }, Cypress.env('EXPIRES_IN'), true);

  return [
    paymentTransactionDocument,
    splitTransactionDocument,
  ];
};

describe('DELETE /category/v1/categories/{categoryId}', () => {
  const category: Category.Request = {
    name: 'category',
    categoryType: 'regular',
    parentCategoryId: undefined,
  };

  let categoryDocument: Category.Document;

  beforeEach(() => {
    categoryDocument = categoryDocumentConverter.create({
      body: category,
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteCategory(createCategoryId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    it('should delete category', () => {
      cy.saveCategoryDocument(categoryDocument)
        .authenticate(1)
        .requestDeleteCategory(getCategoryId(categoryDocument))
        .expectNoContentResponse()
        .validateCategoryDeleted(getCategoryId(categoryDocument));
    });

    describe('children should be reassigned', () => {
      let childCategory: Category.Document;
      let grandChildCategory: Category.Document;

      beforeEach(() => {
        childCategory = categoryDocumentConverter.create({
          body: {
            name: 'child',
            categoryType: 'regular',
            parentCategoryId: getCategoryId(categoryDocument),
          },
          parentCategory: categoryDocument,
        }, Cypress.env('EXPIRES_IN'), true);

        grandChildCategory = categoryDocumentConverter.create({
          body: {
            name: 'child of child',
            categoryType: 'regular',
            parentCategoryId: getCategoryId(childCategory),
          },
          parentCategory: childCategory,
        }, Cypress.env('EXPIRES_IN'), true);
      });

      it('to root if did not have parent', () => {
        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .authenticate(1)
          .requestDeleteCategory(getCategoryId(categoryDocument))
          .expectNoContentResponse()
          .validateCategoryDeleted(getCategoryId(categoryDocument))
          .validateCategoryParentReassign(getCategoryId(childCategory))
          .validateCategoryParentReassign(getCategoryId(grandChildCategory), getCategoryId(childCategory));
      });

      it('to parent if had parent', () => {
        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .authenticate(1)
          .requestDeleteCategory(getCategoryId(childCategory))
          .expectNoContentResponse()
          .validateCategoryDeleted(getCategoryId(childCategory))
          .validateCategoryParentReassign(getCategoryId(grandChildCategory), getCategoryId(categoryDocument));
      });
    });

    describe('in related transactions category', () => {
      let paymentTransactionDocument: Transaction.PaymentDocument;
      let splitTransactionDocument: Transaction.SplitDocument;
      let accountDocument: Account.Document;

      beforeEach(() => {
        accountDocument = accountDocumentConverter.create({
          name: 'account',
          accountType: 'bankAccount',
          currency: 'Ft',
        }, Cypress.env('EXPIRES_IN'), true);
      });
      it('should be unset if category is deleted', () => {
        [
          paymentTransactionDocument,
          splitTransactionDocument,
        ] = createRelatedTransactions(accountDocument, categoryDocument);

        cy.saveAccountDocument(accountDocument)
          .saveCategoryDocument(categoryDocument)
          .saveTransactionDocument(paymentTransactionDocument)
          .saveTransactionDocument(splitTransactionDocument)
          .authenticate(1)
          .requestDeleteCategory(getCategoryId(categoryDocument))
          .expectNoContentResponse()
          .validateCategoryDeleted(getCategoryId(categoryDocument))
          .validateCategoryUnset(getTransactionId(paymentTransactionDocument))
          .validateCategoryUnset(getTransactionId(splitTransactionDocument), 0);
      });

      it('should be set to parent category if child is deleted', () => {
        const childCategoryDocument = categoryDocumentConverter.create({
          body: {
            categoryType: 'regular',
            name: 'child',
            parentCategoryId: getCategoryId(categoryDocument),
          },
          parentCategory: categoryDocument,
        }, Cypress.env('EXPIRES_IN'), true);

        [
          paymentTransactionDocument,
          splitTransactionDocument,
        ] = createRelatedTransactions(accountDocument, childCategoryDocument);

        cy.saveAccountDocument(accountDocument)
          .saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategoryDocument)
          .saveTransactionDocument(paymentTransactionDocument)
          .saveTransactionDocument(splitTransactionDocument)
          .authenticate(1)
          .requestDeleteCategory(getCategoryId(childCategoryDocument))
          .expectNoContentResponse()
          .validateCategoryDeleted(getCategoryId(childCategoryDocument))
          .validateCategoryUpdate(getTransactionId(paymentTransactionDocument), getCategoryId(categoryDocument))
          .validateCategoryUpdate(getTransactionId(splitTransactionDocument), getCategoryId(categoryDocument), 0);
      });
    });

    describe('should return error', () => {
      describe('if categoryId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestDeleteCategory(createCategoryId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('categoryId', 'pathParameters');
        });
      });
    });
  });
});
