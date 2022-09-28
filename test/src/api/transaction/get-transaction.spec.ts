import { createAccountId, createTransactionId } from '@household/shared/common/test-data-factory';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { default as paymentTransactionSchema } from '@household/test/api/schemas/transaction-payment-response';
import { default as transferTransactionSchema } from '@household/test/api/schemas/transaction-transfer-response';
import { default as splitTransactionSchema } from '@household/test/api/schemas/transaction-split-response';
import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId, toDictionary } from '@household/shared/common/utils';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';

describe('GET /transaction/v1/accounts/{accountId}/transactions/{transactionId}', () => {
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
        .requestGetTransaction(getAccountId(accountDocument), createTransactionId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get regular payment transaction', () => {
      const document = transactionDocumentConverter.createPaymentDocument({
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

      cy.saveAccountDocument(accountDocument)
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(regularCategoryDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        .expectValidResponseSchema(paymentTransactionSchema)
        .validateTransactionPaymentResponse(document);
    });

    it('should get inventory payment transaction', () => {
      const document = transactionDocumentConverter.createPaymentDocument({
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

      cy.saveAccountDocument(accountDocument)
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(inventoryCategoryDocument)
        .saveProductDocument(productDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        .expectValidResponseSchema(paymentTransactionSchema)
        .validateTransactionPaymentResponse(document);
    });

    it('should get invoice payment transaction', () => {
      const document = transactionDocumentConverter.createPaymentDocument({
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

      cy.saveAccountDocument(accountDocument)
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(invoiceCategoryDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        .expectValidResponseSchema(paymentTransactionSchema)
        .validateTransactionPaymentResponse(document);
    });

    it('should get split transaction', () => {
      cy.saveAccountDocument(accountDocument)
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(regularCategoryDocument)
        .saveCategoryDocument(invoiceCategoryDocument)
        .saveCategoryDocument(inventoryCategoryDocument)
        .saveProductDocument(productDocument)
        .saveTransactionDocument(splitTransactionDocument)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(splitTransactionDocument))
        .expectOkResponse()
        .expectValidResponseSchema(splitTransactionSchema)
        .validateTransactionSplitResponse(splitTransactionDocument);
    });

    it('should get transfer transaction', () => {
      cy.saveAccountDocument(accountDocument)
        .saveAccountDocument(transferAccountDocument)
        .saveTransactionDocument(transferTransactionDocument)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(transferTransactionDocument))
        .expectOkResponse()
        .expectValidResponseSchema(transferTransactionSchema)
        .validateTransactionTransferResponse(transferTransactionDocument);
    });

    describe('should return error', () => {
      describe('if transactionId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestGetTransaction(createAccountId(), createTransactionId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('transactionId', 'pathParameters');
        });

        it('does not belong to any transaction', () => {
          cy.authenticate(1)
            .requestGetTransaction(createAccountId(), createTransactionId())
            .expectNotFoundResponse();
        });
      });

      describe('if accountId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestGetTransaction(createAccountId('not-valid'), createTransactionId())
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'pathParameters');
        });
      });
    });
  });
});
