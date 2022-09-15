import { createAccountId, createCategoryId, createTransactionId } from '@household/shared/common/test-data-factory';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Category, Transaction } from '@household/shared/types/types';
import { Types } from 'mongoose';

const createRelatedTransactions = (accountDocument: Account.Document, categoryDocument: Category.Document): [Transaction.PaymentDocument, Transaction.SplitDocument] => {
  const paymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
    body: {
      accountId: createAccountId(accountDocument._id),
      amount: 100,
      description: 'description',
      issuedAt: new Date(2022, 2, 3).toISOString(),
      categoryId: createCategoryId(categoryDocument._id),
      inventory: undefined,
      invoice: undefined,
      projectId: undefined,
      recipientId: undefined,
    },
    account: accountDocument,
    category: categoryDocument,
    project: undefined,
    recipient: undefined,
  }, Cypress.env('EXPIRES_IN'));
  paymentTransactionDocument._id = new Types.ObjectId();

  const splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
    body: {
      accountId: createAccountId(accountDocument._id),
      amount: 200,
      description: 'description',
      issuedAt: new Date(2022, 2, 3).toISOString(),
      recipientId: undefined,
      splits: [
        {
          amount: 100,
          categoryId: createCategoryId(categoryDocument._id),
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
    categories: [categoryDocument],
    projects: [],
  }, Cypress.env('EXPIRES_IN'));
  splitTransactionDocument._id = new Types.ObjectId();

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
    }, Cypress.env('EXPIRES_IN'));
    categoryDocument._id = new Types.ObjectId();
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
        .requestDeleteCategory(createCategoryId(categoryDocument._id))
        .expectNoContentResponse()
        .validateCategoryDeleted(createCategoryId(categoryDocument._id));
    });

    describe('children should be reassigned', () => {
      let childCategory: Category.Document;
      let grandChildCategory: Category.Document;

      beforeEach(() => {
        childCategory = categoryDocumentConverter.create({
          body: {
            name: 'child',
            categoryType: 'regular',
            parentCategoryId: createCategoryId(categoryDocument._id),
          },
          parentCategory: categoryDocument,
        }, Cypress.env('EXPIRES_IN'));
        childCategory._id = new Types.ObjectId();

        grandChildCategory = categoryDocumentConverter.create({
          body: {
            name: 'child of child',
            categoryType: 'regular',
            parentCategoryId: createCategoryId(childCategory._id),
          },
          parentCategory: childCategory,
        }, Cypress.env('EXPIRES_IN'));
        grandChildCategory._id = new Types.ObjectId();
      });

      it('to root if did not have parent', () => {
        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .authenticate(1)
          .requestDeleteCategory(createCategoryId(categoryDocument._id))
          .expectNoContentResponse()
          .validateCategoryDeleted(createCategoryId(categoryDocument._id))
          .validateCategoryParentReassign(createCategoryId(childCategory._id))
          .validateCategoryParentReassign(createCategoryId(grandChildCategory._id), createCategoryId(childCategory._id));
      });

      it('to parent if had parent', () => {
        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .authenticate(1)
          .requestDeleteCategory(createCategoryId(childCategory._id))
          .expectNoContentResponse()
          .validateCategoryDeleted(createCategoryId(childCategory._id))
          .validateCategoryParentReassign(createCategoryId(grandChildCategory._id), createCategoryId(categoryDocument._id));
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
        }, Cypress.env('EXPIRES_IN'));
        accountDocument._id = new Types.ObjectId();
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
          .requestDeleteCategory(createCategoryId(categoryDocument._id))
          .expectNoContentResponse()
          .validateCategoryDeleted(createCategoryId(categoryDocument._id))
          .validateCategoryUnset(createTransactionId(paymentTransactionDocument._id))
          .validateCategoryUnset(createTransactionId(splitTransactionDocument._id), 0);
      });

      it('should be set to parent category if child is deleted', () => {
        const childCategoryDocument = categoryDocumentConverter.create({
          body: {
            categoryType: 'regular',
            name: 'child',
            parentCategoryId: createCategoryId(categoryDocument._id),
          },
          parentCategory: categoryDocument,
        }, Cypress.env('EXPIRES_IN'));
        childCategoryDocument._id = new Types.ObjectId();

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
          .requestDeleteCategory(createCategoryId(childCategoryDocument._id))
          .expectNoContentResponse()
          .validateCategoryDeleted(createCategoryId(childCategoryDocument._id))
          .validateCategoryUpdate(createTransactionId(paymentTransactionDocument._id), createCategoryId(categoryDocument._id))
          .validateCategoryUpdate(createTransactionId(splitTransactionDocument._id), createCategoryId(categoryDocument._id), 0);
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
