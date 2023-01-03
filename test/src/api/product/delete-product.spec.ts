import { createProductId } from '@household/shared/common/test-data-factory';
import { getAccountId, getCategoryId, getProductId, toDictionary } from '@household/shared/common/utils';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Category, Product, Transaction } from '@household/shared/types/types';
import { v4 as uuid } from 'uuid';

describe('DELETE /product/v1/products/{productId}', () => {
  let productDocument: Product.Document;
  let categoryDocument: Category.Document;
  let categoryId: Category.IdType;

  beforeEach(() => {
    productDocument = productDocumentConverter.create({
      brand: `tesco-${uuid}`,
      measurement: 1,
      unitOfMeasurement: 'kg',
    }, Cypress.env('EXPIRES_IN'), true);
    categoryDocument = categoryDocumentConverter.create({
      body: {
        categoryType: 'inventory',
        name: `inv cat-${uuid()}`,
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);
    categoryId = getCategoryId(categoryDocument);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteProduct(createProductId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    it('should delete product', () => {
      cy.saveProductDocument({
        document: productDocument,
        categoryId,
      })
        .authenticate(1)
        .requestDeleteProduct(getProductId(productDocument))
        .expectNoContentResponse()
        .validateProductDeleted(getProductId(productDocument));
    });

    describe('in related transactions inventory', () => {
      let paymentTransactionDocument: Transaction.PaymentDocument;
      let splitTransactionDocument: Transaction.SplitDocument;
      let accountDocument: Account.Document;

      beforeEach(() => {
        accountDocument = accountDocumentConverter.create({
          name: `account-${uuid()}`,
          accountType: 'bankAccount',
          currency: 'Ft',
        }, Cypress.env('EXPIRES_IN'), true);

        paymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
          body: {
            accountId: getAccountId(accountDocument),
            amount: 100,
            description: 'description',
            issuedAt: new Date(2022, 2, 3).toISOString(),
            categoryId,
            inventory: {
              quantity: 10,
              productId: getProductId(productDocument),
            },
            invoice: undefined,
            projectId: undefined,
            recipientId: undefined,
          },
          account: accountDocument,
          category: categoryDocument,
          product: productDocument,
          recipient: undefined,
          project: undefined,
        }, Cypress.env('EXPIRES_IN'), true);

        splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
          body: {
            accountId: getAccountId(accountDocument),
            amount: 200,
            description: 'description',
            issuedAt: new Date(2022, 2, 3).toISOString(),
            recipientId: undefined,
            splits: [
              {
                amount: 100,
                categoryId,
                description: undefined,
                inventory: {
                  quantity: 10,
                  productId: getProductId(productDocument),
                },
                invoice: undefined,
                projectId: undefined,
              },
              {
                amount: 100,
                categoryId,
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
          products: toDictionary([productDocument], '_id'),
          projects: {},
        }, Cypress.env('EXPIRES_IN'), true);
      });
      it('should be unset if product is deleted', () => {
        cy.saveAccountDocument(accountDocument)
          .saveCategoryDocument(categoryDocument)
          .saveProductDocument({
            document: productDocument,
            categoryId,
          })
          .saveTransactionDocument(paymentTransactionDocument)
          .saveTransactionDocument(splitTransactionDocument)
          .authenticate(1)
          .requestDeleteProduct(getProductId(productDocument))
          .expectNoContentResponse()
          .validateProductDeleted(getProductId(productDocument))
          .validateInventoryUnset(paymentTransactionDocument)
          .validateInventoryUnset(splitTransactionDocument, 0);
      });
    });

    describe('should return error', () => {
      describe('if productId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestDeleteProduct(createProductId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('productId', 'pathParameters');
        });
      });
    });
  });
});
