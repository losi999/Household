import { Account, Category, Product, Project, Recipient } from '@household/shared/types/types';
import { default as paymentTransactionSchema } from '@household/test/api/schemas/transaction-payment-response';
import { default as deferredTransactionSchema } from '@household/test/api/schemas/transaction-deferred-response';
import { default as reimbursementTransactionSchema } from '@household/test/api/schemas/transaction-reimbursement-response';
import { default as transferTransactionSchema } from '@household/test/api/schemas/transaction-transfer-response';
import { default as loanTransferTransactionSchema } from '@household/test/api/schemas/transaction-loan-transfer-response';
import { default as splitTransactionSchema } from '@household/test/api/schemas/transaction-split-response';
import { getAccountId, getTransactionId } from '@household/shared/common/utils';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { loanTransferTransactionDataFactory } from '@household/test/api/transaction/loan-transfer/loan-transfer-data-factory';

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
        .expectValidResponseSchema(paymentTransactionSchema)
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
        .expectValidResponseSchema(paymentTransactionSchema)
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
        .expectValidResponseSchema(paymentTransactionSchema)
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
        .expectValidResponseSchema(deferredTransactionSchema)
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
        .expectValidResponseSchema(deferredTransactionSchema)
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
        .expectValidResponseSchema(deferredTransactionSchema)
        .validateTransactionDeferredResponse(document);
    });

    it('should get owning deferred transaction', () => {
      const document = deferredTransactionDataFactory.document({
        account: transferAccountDocument,
        category: regularCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        loanAccount: accountDocument,
      });

      cy.saveAccountDocuments([
        accountDocument,
        transferAccountDocument,
      ])
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(regularCategoryDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        .expectValidResponseSchema(deferredTransactionSchema)
        .validateTransactionDeferredResponse(document);
    });

    it('should get paying deferred transaction which has been repaid', () => {
      const document = deferredTransactionDataFactory.document({
        body: {
          amount: -5000,
        },
        account: accountDocument,
        category: regularCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        loanAccount: transferAccountDocument,
      });

      const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
        account: transferAccountDocument,
        transferAccount: accountDocument,
        body: {
          amount: -1500,
        },
        transactions: [document],
      });

      cy.saveAccountDocuments([
        accountDocument,
        transferAccountDocument,
      ])
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(regularCategoryDocument)
        .saveTransactionDocuments([
          document,
          repayingTransferTransactionDocument,
        ])
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        .expectValidResponseSchema(deferredTransactionSchema)
        .validateTransactionDeferredResponse(document, repayingTransferTransactionDocument.payments[0].amount);
    });

    it('should get owning deferred transaction which has been repaid', () => {
      const document = deferredTransactionDataFactory.document({
        body: {
          amount: -5000,
        },
        account: transferAccountDocument,
        category: regularCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        loanAccount: accountDocument,
      });

      const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
        account: accountDocument,
        transferAccount: transferAccountDocument,
        body: {
          amount: -1500,
        },
        transactions: [document],
      });

      cy.saveAccountDocuments([
        accountDocument,
        transferAccountDocument,
      ])
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(regularCategoryDocument)
        .saveTransactionDocuments([
          document,
          repayingTransferTransactionDocument,
        ])
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        .expectValidResponseSchema(deferredTransactionSchema)
        .validateTransactionDeferredResponse(document, repayingTransferTransactionDocument.payments[0].amount);
    });

    it('should get paying deferred transaction which has been settled', () => {
      const document = deferredTransactionDataFactory.document({
        body: {
          isSettled: true,
        },
        account: accountDocument,
        category: regularCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        loanAccount: transferAccountDocument,
      });

      cy.saveAccountDocuments([
        accountDocument,
        transferAccountDocument,
      ])
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(regularCategoryDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        .expectValidResponseSchema(deferredTransactionSchema)
        .validateTransactionDeferredResponse(document);
    });

    it('should get owning deferred transaction which has been settled', () => {
      const document = deferredTransactionDataFactory.document({
        body: {
          isSettled: true,
        },
        account: transferAccountDocument,
        category: regularCategoryDocument,
        project: projectDocument,
        recipient: recipientDocument,
        loanAccount: accountDocument,
      });

      cy.saveAccountDocuments([
        accountDocument,
        transferAccountDocument,
      ])
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocument(regularCategoryDocument)
        .saveTransactionDocument(document)
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        .expectValidResponseSchema(deferredTransactionSchema)
        .validateTransactionDeferredResponse(document);
    });

    it('should get regular owning reimbursement transaction', () => {
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
        .expectValidResponseSchema(reimbursementTransactionSchema)
        .validateTransactionReimbursementResponse(document);
    });

    it('should get regular paying reimbursement transaction', () => {
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
        .requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document))
        .expectOkResponse()
        .expectValidResponseSchema(reimbursementTransactionSchema)
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
        .expectValidResponseSchema(reimbursementTransactionSchema)
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
        .expectValidResponseSchema(reimbursementTransactionSchema)
        .validateTransactionReimbursementResponse(document);
    });

    it('should get paying split transaction', () => {
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
          {
            loanAccount: transferAccountDocument,
            amount: -500,
          },
          {
            loanAccount: transferAccountDocument,
            isSettled: true,
          },
        ],
      });

      const lastDeferredSplit = document.deferredSplits[document.deferredSplits.length - 2];

      const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
        account: transferAccountDocument,
        transferAccount: accountDocument,
        body: {
          amount: -1500,
        },
        transactions: [lastDeferredSplit],
      });

      cy.saveAccountDocuments([
        accountDocument,
        loanAccountDocument,
        transferAccountDocument,
      ])
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveCategoryDocuments([
          regularCategoryDocument,
          invoiceCategoryDocument,
          inventoryCategoryDocument,
        ])
        .saveProductDocument(productDocument)
        .saveTransactionDocuments([
          document,
          repayingTransferTransactionDocument,
        ])
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        .expectValidResponseSchema(splitTransactionSchema)
        .validateTransactionSplitResponse(document, {
          [getTransactionId(lastDeferredSplit)]: repayingTransferTransactionDocument.payments[0].amount,
        });
    });

    it('should get owning split transaction', () => {
      const document = splitTransactionDataFactory.document({
        account: transferAccountDocument,
        recipient: recipientDocument,
        splits: [
          {
            project: projectDocument,
          },
          {
            loanAccount: accountDocument,
          },
          {
            loanAccount: accountDocument,
            isSettled: true,
          },
          {
            loanAccount: accountDocument,
            amount: -500,
          },
        ],
      });

      const lastDeferredSplit = document.deferredSplits[document.deferredSplits.length - 1];

      const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
        account: accountDocument,
        transferAccount: transferAccountDocument,
        body: {
          amount: -1500,
        },
        transactions: [lastDeferredSplit],
      });

      cy.saveAccountDocuments([
        accountDocument,
        transferAccountDocument,
      ])
        .saveProjectDocument(projectDocument)
        .saveRecipientDocument(recipientDocument)
        .saveTransactionDocuments([
          document,
          repayingTransferTransactionDocument,
        ])
        .authenticate(1)
        .requestGetTransaction(getAccountId(accountDocument), getTransactionId(document))
        .expectOkResponse()
        .expectValidResponseSchema(splitTransactionSchema)
        .validateTransactionSplitResponse(document, {
          [getTransactionId(lastDeferredSplit)]: repayingTransferTransactionDocument.payments[0].amount,
        });
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
        .expectValidResponseSchema(transferTransactionSchema)
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
        .expectValidResponseSchema(loanTransferTransactionSchema)
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
