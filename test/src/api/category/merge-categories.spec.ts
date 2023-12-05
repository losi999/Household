import { createCategoryId } from '@household/shared/common/test-data-factory';
import { getAccountId, getCategoryId, getProductId, toDictionary } from '@household/shared/common/utils';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Category, Product, Transaction } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('POST category/v1/categories/{categoryId}/merge', () => {
  let accountDocument: Account.Document;
  let sourceCategoryDocument: Category.Document;
  let targetCategoryDocument: Category.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let splitTransactionDocument: Transaction.SplitDocument;
  let productOfSourceCategoryDocument: Product.Document;
  let productOfTargetCategoryDocument: Product.Document;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create({
      accountType: 'bankAccount',
      currency: 'Ft',
      name: `acocunt-${uuid()}`,
    }, Cypress.env('EXPIRES_IN'), true);

    sourceCategoryDocument = categoryDocumentConverter.create({
      body: {
        categoryType: 'regular',
        name: `source-${uuid()}`,
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    targetCategoryDocument = categoryDocumentConverter.create({
      body: {
        categoryType: 'regular',
        name: `target-${uuid()}`,
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    productOfSourceCategoryDocument = productDocumentConverter.create({
      body: {
        brand: `sourceprod-${uuid()}`,
        measurement: 100,
        unitOfMeasurement: 'g',
      },
      category: sourceCategoryDocument,
    }, Cypress.env('EXPIRES_IN'), true);

    productOfTargetCategoryDocument = productDocumentConverter.create({
      body: {
        brand: `targetprod-${uuid()}`,
        measurement: 100,
        unitOfMeasurement: 'g',
      },
      category: targetCategoryDocument,
    }, Cypress.env('EXPIRES_IN'), true);

    paymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
      body: {
        accountId: getAccountId(accountDocument),
        amount: 100,
        categoryId: getCategoryId(sourceCategoryDocument),
        description: 'desc',
        inventory: undefined,
        issuedAt: new Date().toISOString(),
        projectId: undefined,
        recipientId: undefined,
        invoice: undefined,
      },
      account: accountDocument,
      category: sourceCategoryDocument,
      product: undefined,
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
            categoryId: getCategoryId(sourceCategoryDocument),
            description: 'desc',
            inventory: undefined,
            projectId: undefined,
            invoice: undefined,
          },
          {
            amount: 50,
            categoryId: getCategoryId(targetCategoryDocument),
            description: 'desc',
            inventory: undefined,
            projectId: undefined,
            invoice: undefined,
          },
        ],
      },
      account: accountDocument,
      categories: toDictionary([
        sourceCategoryDocument,
        targetCategoryDocument,
      ], '_id'),
      products: undefined,
      recipient: undefined,
      projects: {},
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestMergeCategories(createCategoryId(), [createCategoryId()])
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it.only('should merge categories', () => {
      cy.saveAccountDocument(accountDocument)
        .saveCategoryDocument(sourceCategoryDocument)
        .saveCategoryDocument(targetCategoryDocument)
        .saveProductDocument(productOfSourceCategoryDocument)
        .saveProductDocument(productOfTargetCategoryDocument)
        .saveTransactionDocument(paymentTransactionDocument)
        .saveTransactionDocument(splitTransactionDocument)
        .authenticate(1)
        .requestMergeCategories(getCategoryId(targetCategoryDocument), [getCategoryId(sourceCategoryDocument)])
        .expectCreatedResponse()
        .validateCategoryDeleted(getCategoryId(sourceCategoryDocument))
        .validateProductReassigned(getProductId(productOfSourceCategoryDocument), getCategoryId(targetCategoryDocument))
        .validatePartiallyReassignedPaymentDocument(paymentTransactionDocument, {
          category: getCategoryId(targetCategoryDocument),
        })
        .validatePartiallyReassignedSplitDocument(splitTransactionDocument, 0, {
          category: getCategoryId(targetCategoryDocument),
        });
    });

    describe('should return error', () => {
      it('if a source category does not exist', () => {
        cy.saveCategoryDocument(sourceCategoryDocument)
          .saveCategoryDocument(targetCategoryDocument)
          .authenticate(1)
          .requestMergeCategories(getCategoryId(targetCategoryDocument), [
            getCategoryId(sourceCategoryDocument),
            createCategoryId(),
          ])
          .expectBadRequestResponse()
          .expectMessage('Some of the categories are not found');
      });

      describe('if body', () => {
        it('is not array', () => {
          cy.authenticate(1)
            .requestMergeCategories(createCategoryId(), {} as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'array', 'body');
        });

        it('has too few items', () => {
          cy.authenticate(1)
            .requestMergeCategories(createCategoryId(), [])
            .expectBadRequestResponse()
            .expectTooFewItemsProperty('data', 1, 'body');
        });
      });

      describe('if body[0]', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestMergeCategories(createCategoryId(), [1] as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'string', 'body');
        });

        it('is not a valid mongo id', () => {
          cy.authenticate(1)
            .requestMergeCategories(createCategoryId(), [createCategoryId('not-valid')])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('data', 'body');
        });
      });

      describe('is categoryId', () => {
        it('is not a valid mongo id', () => {
          cy.authenticate(1)
            .requestMergeCategories(createCategoryId('not-valid'), [createCategoryId()])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('categoryId', 'pathParameters');
        });

        it('does not belong to any category', () => {
          cy.authenticate(1)
            .requestMergeCategories(createCategoryId(), [getCategoryId(sourceCategoryDocument)])
            .expectBadRequestResponse()
            .expectMessage('Some of the categories are not found');
        });
      });
    });
  });
});
