import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { default as schema } from '@household/test/api/schemas/transaction-response-list';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { createAccountId } from '@household/shared/common/test-data-factory';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, toDictionary } from '@household/shared/common/utils';

describe('GET /transaction/v1/accounts/{accountId}/transactions', () => {
  let accountDocument: Account.Document;
  let transferAccountDocument: Account.Document;
  let projectDocument: Project.Document;
  let recipientDocument: Recipient.Document;
  let regularCategoryDocument: Category.Document;
  let inventoryCategoryDocument: Category.Document;
  let invoiceCategoryDocument: Category.Document;
  let productDocument: Product.Document;
  let splitTransactionDocument: Transaction.SplitDocument;
  let transferTransactionDocument: Transaction.TransferDocument;
  let transactionPaymentRequest: Transaction.PaymentRequest;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create({
      name: 'account',
      accountType: 'bankAccount',
      currency: 'Ft',
    }, Cypress.env('EXPIRES_IN'), true);

    transferAccountDocument = accountDocumentConverter.create({
      name: 'account2',
      accountType: 'bankAccount',
      currency: 'Ft',
    }, Cypress.env('EXPIRES_IN'), true);

    recipientDocument = recipientDocumentConverter.create({
      name: 'recipient',
    }, Cypress.env('EXPIRES_IN'), true);

    projectDocument = projectDocumentConverter.create({
      name: 'project',
      description: 'decription',
    }, Cypress.env('EXPIRES_IN'), true);

    regularCategoryDocument = categoryDocumentConverter.create({
      body: {
        name: 'category',
        categoryType: 'regular',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    inventoryCategoryDocument = categoryDocumentConverter.create({
      body: {
        name: 'category',
        categoryType: 'inventory',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    invoiceCategoryDocument = categoryDocumentConverter.create({
      body: {
        name: 'category',
        categoryType: 'invoice',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'), true);

    productDocument = productDocumentConverter.create({
      body: {
        brand: 'brand',
        measurement: 500,
        unitOfMeasurement: 'g',
      },
      category: inventoryCategoryDocument,
    }, Cypress.env('EXPIRES_IN'), true);

    transactionPaymentRequest = {
      accountId: getAccountId(accountDocument),
      amount: 100,
      issuedAt: new Date().toISOString(),
      categoryId: undefined,
      description: 'payment',
      inventory: {
        productId: getProductId(productDocument),
        quantity: 3,
      },
      invoice: {
        billingEndDate: '2022-02-20',
        billingStartDate: '2022-02-01',
        invoiceNumber: 'invNumber',
      },
      projectId: getProjectId(projectDocument),
      recipientId: getRecipientId(recipientDocument),
    };

    splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
      body: {
        accountId: getAccountId(accountDocument),
        amount: 300,
        issuedAt: new Date().toISOString(),
        description: 'split',
        recipientId: getRecipientId(recipientDocument),
        splits: [
          {
            amount: 100,
            description: 'split1',
            categoryId: getCategoryId(regularCategoryDocument),
            inventory: undefined,
            invoice: undefined,
            projectId: getProjectId(projectDocument),
          },
          {
            amount: 100,
            description: 'split2',
            categoryId: getCategoryId(invoiceCategoryDocument),
            inventory: undefined,
            invoice: {
              billingEndDate: '2022-02-20',
              billingStartDate: '2022-02-01',
              invoiceNumber: 'invNumber',
            },
            projectId: getProjectId(projectDocument),
          },
          {
            amount: 100,
            description: 'split3',
            categoryId: getCategoryId(inventoryCategoryDocument),
            inventory: {
              productId: getProductId(productDocument),
              quantity: 3,
            },
            invoice: undefined,
            projectId: getProjectId(projectDocument),
          },
        ],
      },
      account: accountDocument,
      categories: toDictionary([
        regularCategoryDocument,
        inventoryCategoryDocument,
        invoiceCategoryDocument,
      ], '_id'),
      recipient: recipientDocument,
      projects: toDictionary([projectDocument], '_id'),
      products: toDictionary([productDocument], '_id'),
    }, Cypress.env('EXPIRES_IN'), true);

    transferTransactionDocument = transactionDocumentConverter.createTransferDocument({
      body: {
        accountId: getAccountId(accountDocument),
        amount: 100,
        transferAccountId: getAccountId(transferAccountDocument),
        description: 'transfer1',
        issuedAt: new Date().toISOString(),
      },
      account: accountDocument,
      transferAccount: transferAccountDocument,
    }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetTransactionListByAccount(getAccountId(accountDocument))
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get a list of transactions', () => {
      const regularPaymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
        body: {
          ...transactionPaymentRequest,
          categoryId: getCategoryId(regularCategoryDocument),
        },
        account: accountDocument,
        category: regularCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        product: productDocument,
      }, Cypress.env('EXPIRES_IN'), true);
      const inventoryPaymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
        body: {
          ...transactionPaymentRequest,
          categoryId: getCategoryId(inventoryCategoryDocument),
        },
        account: accountDocument,
        category: inventoryCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        product: productDocument,
      }, Cypress.env('EXPIRES_IN'), true);
      const invoicePaymentTransactionDocument = transactionDocumentConverter.createPaymentDocument({
        body: {
          ...transactionPaymentRequest,
          categoryId: getCategoryId(invoiceCategoryDocument),
        },
        account: accountDocument,
        category: invoiceCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        product: productDocument,
      }, Cypress.env('EXPIRES_IN'), true);

      cy.saveRecipientDocument(recipientDocument)
        .saveAccountDocument(accountDocument)
        .saveAccountDocument(transferAccountDocument)
        .saveCategoryDocument(regularCategoryDocument)
        .saveCategoryDocument(invoiceCategoryDocument)
        .saveCategoryDocument(inventoryCategoryDocument)
        .saveProjectDocument(projectDocument)
        .saveProductDocument(productDocument)
        .saveTransactionDocument(transferTransactionDocument)
        .saveTransactionDocument(splitTransactionDocument)
        .saveTransactionDocument(regularPaymentTransactionDocument)
        .saveTransactionDocument(inventoryPaymentTransactionDocument)
        .saveTransactionDocument(invoicePaymentTransactionDocument)
        .authenticate(1)
        .requestGetTransactionListByAccount(getAccountId(accountDocument), {
          pageNumber: 1,
          pageSize: 100000,
        })
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateTransactionListResponse([
          transferTransactionDocument,
          splitTransactionDocument,
          regularPaymentTransactionDocument,
          inventoryPaymentTransactionDocument,
          invoicePaymentTransactionDocument,
        ]);
    });

    describe('should return error', () => {
      describe('if querystring', () => {
        it('has additional parameter', () => {
          cy.authenticate(1)
            .requestGetTransactionListByAccount(createAccountId(), {
              pageNumber: 1,
              pageSize: 100,
              extra: 1,
            } as any)
            .expectBadRequestResponse()
            .expectAdditionalProperty('data', 'queryStringParameters');
        });
      });

      describe('if querystring.pageSize', () => {
        it('is missing while pageNumber is set', () => {
          cy.authenticate(1)
            .requestGetTransactionListByAccount(createAccountId(), {
              pageNumber: 1,
              pageSize: undefined,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('pageSize', 'queryStringParameters');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestGetTransactionListByAccount(createAccountId(), {
              pageNumber: 1,
              pageSize: 'asd' as any,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('pageSize', 'queryStringParameters');
        });

        it('is too small', () => {
          cy.authenticate(1)
            .requestGetTransactionListByAccount(createAccountId(), {
              pageNumber: 1,
              pageSize: 0,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('pageSize', 'queryStringParameters');
        });
      });

      describe('if querystring.pageNumber', () => {
        it('is missing while pageSize is set', () => {
          cy.authenticate(1)
            .requestGetTransactionListByAccount(createAccountId(), {
              pageNumber: undefined,
              pageSize: 1,
            })
            .expectBadRequestResponse()
            .expectRequiredProperty('pageNumber', 'queryStringParameters');
        });

        it('is not number', () => {
          cy.authenticate(1)
            .requestGetTransactionListByAccount(createAccountId(), {
              pageNumber: 'asd' as any,
              pageSize: 1,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('pageNumber', 'queryStringParameters');
        });

        it('is too small', () => {
          cy.authenticate(1)
            .requestGetTransactionListByAccount(createAccountId(), {
              pageNumber: 0,
              pageSize: 1,
            })
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('pageNumber', 'queryStringParameters');
        });
      });
    });
  });
});
