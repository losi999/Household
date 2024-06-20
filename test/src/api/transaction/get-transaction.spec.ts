import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { default as paymentTransactionSchema } from '@household/test/api/schemas/transaction-payment-response';
import { default as transferTransactionSchema } from '@household/test/api/schemas/transaction-transfer-response';
import { default as splitTransactionSchema } from '@household/test/api/schemas/transaction-split-response';
import { getAccountId, getTransactionId } from '@household/shared/common/utils';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split-data-factory';
import { loanTransferTransactionDataFactory } from '@household/test/api/transaction/loan-transfer-data-factory';

describe('GET /transaction/v1/accounts/{accountId}/transactions/{transactionId}', () => {
  let accountDocument: Account.Document;
  let loanAccountDocument: Account.Document;
  let transferAccountDocument: Account.Document;
  let projectDocument: Project.Document;
  let recipientDocument: Recipient.Document;
  let regularCategoryDocument: Category.Document;
  let inventoryCategoryDocument: Category.Document;
  let invoiceCategoryDocument: Category.Document;
  let productDocument: Product.Document;

  beforeEach(() => {
    accountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: 'loan',
    });
    transferAccountDocument = accountDataFactory.document();

    recipientDocument = recipientDataFactory.document();

    projectDocument = projectDataFactory.document();

    regularCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: 'regular',
      },
    });

    inventoryCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: 'inventory',
      },
    });

    invoiceCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: 'invoice',
      },
    });

    productDocument = productDataFactory.document({
      category: inventoryCategoryDocument,
    });

    // splitTransactionDocument = transactionDocumentConverter.createSplitDocument({
    //   body: {
    //     accountId: getAccountId(accountDocument),
    //     amount: 300,
    //     issuedAt: new Date().toISOString(),
    //     description: 'split',
    //     recipientId: getRecipientId(recipientDocument),
    //     splits: [
    //       {
    //         amount: 100,
    //         description: 'split1',
    //         categoryId: getCategoryId(regularCategoryDocument),
    //         quantity: undefined,
    //         productId: undefined,
    //         invoiceNumber: undefined,
    //         billingEndDate: undefined,
    //         billingStartDate: undefined,
    //         projectId: getProjectId(projectDocument),
    //       },
    //       {
    //         amount: 100,
    //         description: 'split2',
    //         categoryId: getCategoryId(invoiceCategoryDocument),
    //         quantity: undefined,
    //         productId: undefined,
    //         billingEndDate: '2022-02-20',
    //         billingStartDate: '2022-02-01',
    //         invoiceNumber: 'invNumber',
    //         projectId: getProjectId(projectDocument),
    //       },
    //       {
    //         amount: 100,
    //         description: 'split3',
    //         categoryId: getCategoryId(inventoryCategoryDocument),
    //         productId: getProductId(productDocument),
    //         quantity: 3,
    //         invoiceNumber: undefined,
    //         billingEndDate: undefined,
    //         billingStartDate: undefined,
    //         projectId: getProjectId(projectDocument),
    //       },
    //     ],
    //   },
    //   account: accountDocument,
    //   categories: toDictionary([
    //     regularCategoryDocument,
    //     inventoryCategoryDocument,
    //     invoiceCategoryDocument,
    //   ], '_id'),
    //   recipient: recipientDocument,
    //   projects: toDictionary([projectDocument], '_id'),
    //   products: toDictionary([productDocument], '_id'),
    // }, Cypress.env('EXPIRES_IN'), true);

    // transferTransactionDocument = transactionDocumentConverter.createTransferDocument({
    //   body: {
    //     accountId: getAccountId(accountDocument),
    //     amount: 100,
    //     transferAmount: -10,
    //     transferAccountId: getAccountId(transferAccountDocument),
    //     description: 'transfer1',
    //     issuedAt: new Date().toISOString(),
    //   },
    //   account: accountDocument,
    //   transferAccount: transferAccountDocument,
    // }, Cypress.env('EXPIRES_IN'), true);
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetTransaction(getAccountId(accountDocument), paymentTransactionDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get regular payment transaction', () => {
      const document = paymentTransactionDataFactory.document({
        account: accountDocument,
        category: regularCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
      });

      cy.saveAccountDocument(accountDocument)
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(regularCategoryDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        // .expectValidResponseSchema(paymentTransactionSchema)
        .validateTransactionPaymentResponse(document);
    });

    it('should get inventory payment transaction', () => {
      const document = paymentTransactionDataFactory.document({
        account: accountDocument,
        category: inventoryCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        product: productDocument,
      });

      cy.saveAccountDocument(accountDocument)
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(inventoryCategoryDocument)
        .saveProductDocument(productDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        // .expectValidResponseSchema(paymentTransactionSchema)
        .validateTransactionPaymentResponse(document);
    });

    it('should get invoice payment transaction', () => {
      const document = paymentTransactionDataFactory.document({
        account: accountDocument,
        category: invoiceCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
      });

      cy.saveAccountDocument(accountDocument)
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(invoiceCategoryDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        // .expectValidResponseSchema(paymentTransactionSchema)
        .validateTransactionPaymentResponse(document);
    });

    it('should get regular deferred transaction', () => {
      const document = deferredTransactionDataFactory.document({
        account: accountDocument,
        category: regularCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        loanAccount: loanAccountDocument,
      });

      cy.saveAccountDocuments([
        accountDocument,
        loanAccountDocument,
      ])
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(regularCategoryDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        // .expectValidResponseSchema(paymentTransactionSchema)
        .validateTransactionDeferredResponse(document);
    });

    it('should get inventory deferred transaction', () => {
      const document = deferredTransactionDataFactory.document({
        account: accountDocument,
        category: inventoryCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        product: productDocument,
        loanAccount: loanAccountDocument,
      });

      cy.saveAccountDocuments([
        accountDocument,
        loanAccountDocument,
      ])
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(inventoryCategoryDocument)
        .saveProductDocument(productDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        // .expectValidResponseSchema(paymentTransactionSchema)
        .validateTransactionDeferredResponse(document);
    });

    it('should get invoice deferred transaction', () => {
      const document = deferredTransactionDataFactory.document({
        account: accountDocument,
        category: invoiceCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        loanAccount: loanAccountDocument,
      });

      cy.saveAccountDocuments([
        accountDocument,
        loanAccountDocument,
      ])
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(invoiceCategoryDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        // .expectValidResponseSchema(paymentTransactionSchema)
        .validateTransactionDeferredResponse(document);
    });

    it('should get regular reimbursement transaction', () => {
      const document = reimbursementTransactionDataFactory.document({
        account: loanAccountDocument,
        category: regularCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        loanAccount: accountDocument,
      });

      cy.saveAccountDocuments([
        accountDocument,
        loanAccountDocument,
      ])
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(regularCategoryDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        // .expectValidResponseSchema(paymentTransactionSchema)
        .validateTransactionReimbursementResponse(document);
    });

    it('should get inventory reimbursement transaction', () => {
      const document = reimbursementTransactionDataFactory.document({
        account: loanAccountDocument,
        category: inventoryCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        product: productDocument,
        loanAccount: accountDocument,
      });

      cy.saveAccountDocuments([
        accountDocument,
        loanAccountDocument,
      ])
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(inventoryCategoryDocument)
        .saveProductDocument(productDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        // .expectValidResponseSchema(paymentTransactionSchema)
        .validateTransactionReimbursementResponse(document);
    });

    it('should get invoice reimbursement transaction', () => {
      const document = reimbursementTransactionDataFactory.document({
        account: loanAccountDocument,
        category: invoiceCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        loanAccount: accountDocument,
      });

      cy.saveAccountDocuments([
        accountDocument,
        loanAccountDocument,
      ])
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(invoiceCategoryDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        // .expectValidResponseSchema(paymentTransactionSchema)
        .validateTransactionReimbursementResponse(document);
    });

    it('should get split transaction', () => {
      const document = splitTransactionDataFactory.document({
        account: accountDocument,
        recipient: recipientDocument,
        splits: [
          {
            project: projectDocument,
          },
          {
            category: regularCategoryDocument,
          },
          {
            category: inventoryCategoryDocument,
            product: productDocument,
          },
          {
            category: invoiceCategoryDocument,
          },
          {
            project: projectDocument,
            loanAccount: loanAccountDocument,
          },
          {
            category: regularCategoryDocument,
            loanAccount: loanAccountDocument,
          },
          {
            category: inventoryCategoryDocument,
            product: productDocument,
            loanAccount: loanAccountDocument,
          },
          {
            category: invoiceCategoryDocument,
            loanAccount: loanAccountDocument,
          },

        ],
      });

      cy.saveAccountDocuments([
        accountDocument,
        loanAccountDocument,
      ])
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocuments([
          regularCategoryDocument,
          invoiceCategoryDocument,
          inventoryCategoryDocument,
        ])
        .saveProductDocument(productDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        // .expectValidResponseSchema(splitTransactionSchema)
        .validateTransactionSplitResponse(document);
    });

    it('should get transfer transaction', () => {
      const document = transferTransactionDataFactory.document({
        account: accountDocument,
        transferAccount: transferAccountDocument,
      });

      cy.saveAccountDocuments([
        accountDocument,
        transferAccountDocument,
      ])
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        // .expectValidResponseSchema(transferTransactionSchema)
        .validateTransactionTransferResponse(document, getAccountId(accountDocument));
    });

    it('should get loan transfer transaction', () => {
      const document = loanTransferTransactionDataFactory.document({
        account: loanAccountDocument,
        transferAccount: transferAccountDocument,
      });

      cy.saveAccountDocuments([
        loanAccountDocument,
        transferAccountDocument,
      ])
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document))
        .expectOkResponse()
        // .expectValidResponseSchema(transferTransactionSchema)
        .validateTransactionLoanTransferResponse(document, getAccountId(loanAccountDocument));
    });

    describe('should return error', () => {
      describe('if transactionId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestGetTransaction(accountDataFactory.id(), paymentTransactionDataFactory.id('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('transactionId', 'pathParameters');
        });

        it('does not belong to any transaction', () => {
          cy.authenticate(1)
            .requestGetTransaction(accountDataFactory.id(), paymentTransactionDataFactory.id())
            .expectNotFoundResponse();
        });
      });

      describe('if accountId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestGetTransaction(accountDataFactory.id('not-valid'), paymentTransactionDataFactory.id())
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('accountId', 'pathParameters');
        });
      });
    });
  });
});
