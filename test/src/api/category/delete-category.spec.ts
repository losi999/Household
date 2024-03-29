import { createCategoryId } from '@household/shared/common/test-data-factory';
import { getAccountId, getCategoryId, getProductId, toDictionary } from '@household/shared/common/utils';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Category, Transaction } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

const createRelatedTransactions = (accountDocument: Account.Document, categoryDocument: Category.Document): [Transaction.PaymentDocument, Transaction.SplitDocument] => {
  const paymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
    body: {
      accountId: getAccountId(accountDocument),
      amount: 100,
      description: 'description',
      issuedAt: new Date(2022, 2, 3).toISOString(),
      categoryId: getCategoryId(categoryDocument),
      inventory: categoryDocument.categoryType === 'inventory' ? {
        quantity: 1,
        productId: undefined,
      } : undefined,
      invoice: categoryDocument.categoryType === 'invoice' ? {
        billingEndDate: new Date(2023, 11, 31).toISOString(),
        billingStartDate: new Date(2023, 11, 1).toISOString(),
        invoiceNumber: 'inv number',
      } : undefined,
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
          inventory: categoryDocument.categoryType === 'inventory' ? {
            quantity: 1,
            productId: undefined,
          } : undefined,
          invoice: categoryDocument.categoryType === 'invoice' ? {
            billingEndDate: new Date(2023, 11, 31).toISOString(),
            billingStartDate: new Date(2023, 11, 1).toISOString(),
            invoiceNumber: 'inv number',
          } : undefined,
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
  let categoryDocument: Category.Document;

  beforeEach(() => {
    categoryDocument = categoryDocumentConverter.create({
      body: {
        name: `category-${uuid()}`,
        categoryType: 'regular',
        parentCategoryId: undefined,
      },
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
            name: `child-${uuid()}`,
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
          .validateCategoryParentReassign(childCategory)
          .validateCategoryParentReassign(grandChildCategory, getCategoryId(childCategory));
      });

      it('to parent if had parent', () => {
        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(childCategory)
          .saveCategoryDocument(grandChildCategory)
          .authenticate(1)
          .requestDeleteCategory(getCategoryId(childCategory))
          .expectNoContentResponse()
          .validateCategoryDeleted(getCategoryId(childCategory))
          .validateCategoryParentReassign(grandChildCategory, getCategoryId(categoryDocument));
      });
    });

    describe('in related transactions', () => {
      let accountDocument: Account.Document;
      let paymentTransactionDocument: Transaction.PaymentDocument;
      let splitTransactionDocument: Transaction.SplitDocument;

      beforeEach(() => {
        accountDocument = accountDocumentConverter.create({
          name: `account-${uuid()}`,
          accountType: 'bankAccount',
          currency: 'Ft',
          owner: 'owner1',
        }, Cypress.env('EXPIRES_IN'), true);
      });

      describe('category', () => {

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
            .validatePartiallyUnsetPaymentDocument(paymentTransactionDocument, 'category')
            .validatePartiallyUnsetSplitDocument(splitTransactionDocument, 0, 'category');
        });

        it('should be set to parent category if child is deleted', () => {
          const childCategoryDocument = categoryDocumentConverter.create({
            body: {
              categoryType: 'regular',
              name: `child-${uuid()}`,
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
            .validatePartiallyReassignedPaymentDocument(paymentTransactionDocument, {
              category: getCategoryId(categoryDocument),
            })
            .validatePartiallyReassignedSplitDocument(splitTransactionDocument, 0, {
              category: getCategoryId(categoryDocument),
            });
        });
      });

      describe('inventory', () => {
        it('should be unset if category is deleted', () => {
          categoryDocument = categoryDocumentConverter.create({
            body: {
              name: `category-${uuid()}`,
              categoryType: 'inventory',
              parentCategoryId: undefined,
            },
            parentCategory: undefined,
          }, Cypress.env('EXPIRES_IN'), true);

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
            .validatePartiallyUnsetPaymentDocument(paymentTransactionDocument, 'category', 'inventory')
            .validatePartiallyUnsetSplitDocument(splitTransactionDocument, 0, 'category', 'inventory');
        });
      });

      describe('invoice', () => {
        it('should be unset if category is deleted', () => {
          categoryDocument = categoryDocumentConverter.create({
            body: {
              name: `category-${uuid()}`,
              categoryType: 'invoice',
              parentCategoryId: undefined,
            },
            parentCategory: undefined,
          }, Cypress.env('EXPIRES_IN'), true);

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
            .validatePartiallyUnsetPaymentDocument(paymentTransactionDocument, 'category', 'invoice')
            .validatePartiallyUnsetSplitDocument(splitTransactionDocument, 0, 'category', 'invoice');
        });
      });
    });

    describe('related products', () => {
      it('should be deleted', () => {
        const productDocument = productDocumentConverter.create({
          body: {
            brand: `tesco-${uuid()}}`,
            measurement: 500,
            unitOfMeasurement: 'g',
          },
          category: categoryDocument,
        }, Cypress.env('EXPIRES_IN'), true);

        cy.saveCategoryDocument(categoryDocument)
          .saveProductDocument(productDocument)
          .authenticate(1)
          .requestDeleteCategory(getCategoryId(categoryDocument))
          .expectNoContentResponse()
          .validateCategoryDeleted(getCategoryId(categoryDocument))
          .validateProductDeleted(getProductId(productDocument));
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
