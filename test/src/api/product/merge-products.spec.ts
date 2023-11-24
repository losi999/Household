import { createProductId } from '@household/shared/common/test-data-factory';
import { getAccountId, getCategoryId, getProductId, toDictionary } from '@household/shared/common/utils';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Category, Product, Transaction } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('POST product/v1/products/{productId}/merge', () => {
  let accountDocument: Account.Document;
  let categoryDocument: Category.Document;
  let targetProductDocument: Product.Document;
  let sourceProductDocument: Product.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let splitTransactionDocument: Transaction.SplitDocument;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create({
      accountType: 'bankAccount',
      currency: 'Ft',
      name: `account-${uuid()}`,
    }, Cypress.env('EXPIRES_IN'), true);

    categoryDocument = categoryDocumentConverter.create({
      body: {
        categoryType: 'inventory',
        name: `category-${uuid()}`,
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    targetProductDocument = productDocumentConverter.create({
      brand: `target-${uuid()}`,
      measurement: 100,
      unitOfMeasurement: 'g',
    }, Cypress.env('EXPIRES_IN'), true);

    sourceProductDocument = productDocumentConverter.create({
      brand: `source-${uuid()}`,
      measurement: 1,
      unitOfMeasurement: 'kg',
    }, Cypress.env('EXPIRES_IN'), true);

    paymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
      body: {
        accountId: getAccountId(accountDocument),
        amount: 100,
        categoryId: getCategoryId(categoryDocument),
        description: 'desc',
        inventory: {
          quantity: 100,
          productId: getProductId(sourceProductDocument),
        },
        issuedAt: new Date().toISOString(),
        projectId: undefined,
        recipientId: undefined,
        invoice: undefined,
      },
      account: accountDocument,
      category: categoryDocument,
      product: sourceProductDocument,
      recipient: undefined,
      project: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
      body: {
        accountId: getAccountId(accountDocument),
        amount: 100,
        description: 'desc',
        issuedAt: new Date().toISOString(),
        recipientId: undefined,
        splits: [
          {
            amount: 50,
            categoryId: getCategoryId(categoryDocument),
            description: 'desc',
            inventory: {
              quantity: 100,
              productId: getProductId(sourceProductDocument),
            },
            projectId: undefined,
            invoice: undefined,
          },
          {
            amount: 50,
            categoryId: getCategoryId(categoryDocument),
            description: 'desc',
            inventory: {
              quantity: 100,
              productId: getProductId(targetProductDocument),
            },
            projectId: undefined,
            invoice: undefined,
          },
        ],
      },
      account: accountDocument,
      categories: toDictionary([categoryDocument], '_id'),
      products: toDictionary([
        sourceProductDocument,
        targetProductDocument,
      ], '_id'),
      recipient: undefined,
      projects: {},
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestMergeProducts(createProductId(), [createProductId()])
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should merge products', () => {
      cy.saveAccountDocument(accountDocument)
        .saveCategoryDocument(categoryDocument)
        .saveProductDocument({
          document: targetProductDocument,
          categoryId: getCategoryId(categoryDocument),
        })
        .saveProductDocument({
          document: sourceProductDocument,
          categoryId: getCategoryId(categoryDocument),
        })
        .saveTransactionDocument(paymentTransactionDocument)
        .saveTransactionDocument(splitTransactionDocument)
        .authenticate(1)
        .requestMergeProducts(getProductId(targetProductDocument), [getProductId(sourceProductDocument)])
        .expectCreatedResponse()
        .validateProductDeleted(getProductId(sourceProductDocument))
        .validatePartiallyReassignedPaymentDocument(paymentTransactionDocument, {
          product: getProductId(targetProductDocument),
        })
        .validatePartiallyReassignedSplitDocument(splitTransactionDocument, 0, {
          product: getProductId(targetProductDocument),
        })
        .validateProductRemoval(categoryDocument, [getProductId(sourceProductDocument)]);
    });

    describe('should return error', () => {
      describe('if body', () => {
        it('is not array', () => {
          cy.authenticate(1)
            .requestMergeProducts(createProductId(), {} as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'array', 'body');
        });

        it('has too few items', () => {
          cy.authenticate(1)
            .requestMergeProducts(createProductId(), [])
            .expectBadRequestResponse()
            .expectTooFewItemsProperty('data', 1, 'body');
        });
      });

      describe('if body[0]', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestMergeProducts(createProductId(), [1] as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'string', 'body');
        });

        it('is not a valid mongo id', () => {
          cy.authenticate(1)
            .requestMergeProducts(createProductId(), [createProductId('not-valid')])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('data', 'body');
        });
      });

      describe('is productId', () => {
        it('is not a valid mongo id', () => {
          cy.authenticate(1)
            .requestMergeProducts(createProductId('not-valid'), [createProductId()])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('productId', 'pathParameters');
        });
      });
    });
  });
});
