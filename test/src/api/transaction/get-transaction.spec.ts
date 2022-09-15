import { createAccountId, createCategoryId, createProjectId, createRecipientId, createTransactionId } from '@household/shared/common/test-data-factory';
import { accountDocumentConverter } from '@household/shared/dependencies/converters/account-document-converter';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { projectDocumentConverter } from '@household/shared/dependencies/converters/project-document-converter';
import { recipientDocumentConverter } from '@household/shared/dependencies/converters/recipient-document-converter';
import { transactionDocumentConverter } from '@household/shared/dependencies/converters/transaction-document-converter';
import { Account, Category, Project, Recipient, Transaction } from '@household/shared/types/types';
import { Types } from 'mongoose';
import { default as paymentTransactionSchema } from '@household/test/api/schemas/transaction-payment-response';
import { default as transferTransactionSchema } from '@household/test/api/schemas/transaction-transfer-response';
import { default as splitTransactionSchema } from '@household/test/api/schemas/transaction-split-response';

describe('GET /transaction/v1/accounts/{accountId}/transactions/{transactionId}', () => {
  let accountDocument: Account.Document;
  let transferAccountDocument: Account.Document;
  let projectDocument: Project.Document;
  let recipientDocument: Recipient.Document;
  let regularCategoryDocument: Category.Document;
  let inventoryCategoryDocument: Category.Document;
  let invoiceCategoryDocument: Category.Document;
  let splitTransactionDocument: Transaction.SplitDocument;
  let transferTransactionDocument: Transaction.TransferDocument;
  let transactionPaymentRequest: Transaction.PaymentRequest;

  beforeEach(() => {
    accountDocument = accountDocumentConverter.create({
      name: 'account',
      accountType: 'bankAccount',
      currency: 'Ft',
    }, Cypress.env('EXPIRES_IN'));
    accountDocument._id = new Types.ObjectId();

    transferAccountDocument = accountDocumentConverter.create({
      name: 'account2',
      accountType: 'bankAccount',
      currency: 'Ft',
    }, Cypress.env('EXPIRES_IN'));
    transferAccountDocument._id = new Types.ObjectId();

    recipientDocument = recipientDocumentConverter.create({
      name: 'recipient',
    }, Cypress.env('EXPIRES_IN'));
    recipientDocument._id = new Types.ObjectId();

    projectDocument = projectDocumentConverter.create({
      name: 'project',
      description: 'decription',
    }, Cypress.env('EXPIRES_IN'));
    projectDocument._id = new Types.ObjectId();

    regularCategoryDocument = categoryDocumentConverter.create({
      body: {
        name: 'category',
        categoryType: 'regular',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'));
    regularCategoryDocument._id = new Types.ObjectId();

    inventoryCategoryDocument = categoryDocumentConverter.create({
      body: {
        name: 'category',
        categoryType: 'inventory',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'));
    inventoryCategoryDocument._id = new Types.ObjectId();

    invoiceCategoryDocument = categoryDocumentConverter.create({
      body: {
        name: 'category',
        categoryType: 'invoice',
        parentCategoryId: undefined,
      },
      parentCategory: undefined,
    }, Cypress.env('EXPIRES_IN'));
    invoiceCategoryDocument._id = new Types.ObjectId();

    transactionPaymentRequest = {
      accountId: createAccountId(accountDocument._id),
      amount: 100,
      issuedAt: new Date().toISOString(),
      categoryId: undefined,
      description: 'payment',
      inventory: {
        brand: 'brand',
        measurement: 500,
        quantity: 3,
        unitOfMeasurement: 'g',
      },
      invoice: {
        billingEndDate: '2022-02-20',
        billingStartDate: '2022-02-01',
        invoiceNumber: 'invNumber',
      },
      projectId: createProjectId(projectDocument._id),
      recipientId: createRecipientId(recipientDocument._id),
    };

    splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
      body: {
        accountId: createAccountId(accountDocument._id),
        amount: 300,
        issuedAt: new Date().toISOString(),
        description: 'split',
        recipientId: createRecipientId(recipientDocument._id),
        splits: [
          {
            amount: 100,
            description: 'split1',
            categoryId: createCategoryId(regularCategoryDocument._id),
            inventory: undefined,
            invoice: undefined,
            projectId: createProjectId(projectDocument._id),
          },
          {
            amount: 100,
            description: 'split2',
            categoryId: createCategoryId(invoiceCategoryDocument._id),
            inventory: undefined,
            invoice: {
              billingEndDate: '2022-02-20',
              billingStartDate: '2022-02-01',
              invoiceNumber: 'invNumber',
            },
            projectId: createProjectId(projectDocument._id),
          },
          {
            amount: 100,
            description: 'split3',
            categoryId: createCategoryId(inventoryCategoryDocument._id),
            inventory: {
              brand: 'brand',
              measurement: 500,
              quantity: 3,
              unitOfMeasurement: 'g',
            },
            invoice: undefined,
            projectId: createProjectId(projectDocument._id),
          },
        ],
      },
      account: accountDocument,
      categories: [
        regularCategoryDocument,
        inventoryCategoryDocument,
        invoiceCategoryDocument,
      ],
      recipient: recipientDocument,
      projects: [projectDocument],
    }, Cypress.env('EXPIRES_IN'));
    splitTransactionDocument._id = new Types.ObjectId();

    transferTransactionDocument = transactionDocumentConverter.createTransferDocument({
      body: {
        accountId: createAccountId(accountDocument._id),
        amount: 100,
        transferAccountId: createAccountId(transferAccountDocument._id),
        description: 'transfer1',
        issuedAt: new Date().toISOString(),
      },
      account: accountDocument,
      transferAccount: transferAccountDocument,
    }, Cypress.env('EXPIRES_IN'));
    transferTransactionDocument._id = new Types.ObjectId();
  });

  describe.skip('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetTransaction(createAccountId(accountDocument._id), createTransactionId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get regular payment transaction', () => {
      const document = transactionDocumentConverter.createPaymentDocument({
        body: {
          ...transactionPaymentRequest,
          categoryId: createCategoryId(regularCategoryDocument._id),
        },
        account: accountDocument,
        category: regularCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
      }, Cypress.env('EXPIRES_IN'));
      document._id = new Types.ObjectId();

      cy.saveAccountDocument(accountDocument)
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(regularCategoryDocument)
        .saveTransactionDocument(document)
        .authenticate('admin1')
        .requestGetTransaction(createAccountId(accountDocument._id), createTransactionId(document._id))
        .expectOkResponse()
        .expectValidResponseSchema(paymentTransactionSchema)
        .validateTransactionPaymentResponse(document);
    });

    it('should get inventory payment transaction', () => {
      const document = transactionDocumentConverter.createPaymentDocument({
        body: {
          ...transactionPaymentRequest,
          categoryId: createCategoryId(inventoryCategoryDocument._id),
        },
        account: accountDocument,
        category: inventoryCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
      }, Cypress.env('EXPIRES_IN'));
      document._id = new Types.ObjectId();

      cy.saveAccountDocument(accountDocument)
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(inventoryCategoryDocument)
        .saveTransactionDocument(document)
        .authenticate('admin1')
        .requestGetTransaction(createAccountId(accountDocument._id), createTransactionId(document._id))
        .expectOkResponse()
        .expectValidResponseSchema(paymentTransactionSchema)
        .validateTransactionPaymentResponse(document);
    });

    it('should get invoice payment transaction', () => {
      const document = transactionDocumentConverter.createPaymentDocument({
        body: {
          ...transactionPaymentRequest,
          categoryId: createCategoryId(invoiceCategoryDocument._id),
        },
        account: accountDocument,
        category: invoiceCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
      }, Cypress.env('EXPIRES_IN'));
      document._id = new Types.ObjectId();

      cy.saveAccountDocument(accountDocument)
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(invoiceCategoryDocument)
        .saveTransactionDocument(document)
        .authenticate('admin1')
        .requestGetTransaction(createAccountId(accountDocument._id), createTransactionId(document._id))
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
        .saveTransactionDocument(splitTransactionDocument)
        .authenticate('admin1')
        .requestGetTransaction(createAccountId(accountDocument._id), createTransactionId(splitTransactionDocument._id))
        .expectOkResponse()
        .expectValidResponseSchema(splitTransactionSchema)
        .validateTransactionSplitResponse(splitTransactionDocument);
    });

    it('should get transfer transaction', () => {
      cy.saveAccountDocument(accountDocument)
        .saveAccountDocument(transferAccountDocument)
        .saveTransactionDocument(transferTransactionDocument)
        .authenticate('admin1')
        .requestGetTransaction(createAccountId(accountDocument._id), createTransactionId(transferTransactionDocument._id))
        .expectOkResponse()
        .expectValidResponseSchema(transferTransactionSchema)
        .validateTransactionTransferResponse(transferTransactionDocument);
    });

    describe('should return error', () => {
      describe('if transactionId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestGetTransaction(createAccountId(), createTransactionId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('transactionId', 'pathParameters');
        });

        it('does not belong to any transaction', () => {
          cy.authenticate('admin1')
            .requestGetTransaction(createAccountId(), createTransactionId())
            .expectNotFoundResponse();
        });
      });

      describe('if accountId', () => {
        it('is not mongo id', () => {
          cy.authenticate('admin1')
            .requestGetTransaction(createAccountId('not-valid'), createTransactionId())
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'pathParameters');
        });
      });
    });
  });
});
