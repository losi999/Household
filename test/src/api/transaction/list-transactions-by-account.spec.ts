import { default as schema } from '@household/test/api/schemas/transaction-response-list';
import { Account } from '@household/shared/types/types';
import { createAccountId } from '@household/shared/common/test-data-factory';
import { getAccountId } from '@household/shared/common/utils';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer-data-factory';
import { loanTransferTransactionDataFactory } from '@household/test/api/transaction/loan-transfer-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement-data-factory';

describe('GET /transaction/v1/accounts/{accountId}/transactions', () => {
  let accountDocument: Account.Document;

  beforeEach(() => {
    accountDocument = accountDataFactory.document();
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
      const loanAccountDocument = accountDataFactory.document({
        accountType: 'loan',
      });
      const transferAccountDocument = accountDataFactory.document();
      const projectDocument = projectDataFactory.document();
      const recipientDocument = recipientDataFactory.document();
      const regularCategoryDocument = categoryDataFactory.document({
        body: {
          categoryType: 'regular',
        },
      });
      const inventoryCategoryDocument = categoryDataFactory.document({
        body: {
          categoryType: 'inventory',
        },
      });
      const invoiceCategoryDocument = categoryDataFactory.document({
        body: {
          categoryType: 'invoice',
        },
      });
      const productDocument = productDataFactory.document({
        category: inventoryCategoryDocument,
      });

      const paymentTransactionDocument = paymentTransactionDataFactory.document({
        account: accountDocument,
        recipient: recipientDocument,
        project: projectDocument,
        category: inventoryCategoryDocument,
        product: productDocument,
      });

      const splitTransactionDocument = splitTransactionDataFactory.document({
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

      const transferTransactionDocument = transferTransactionDataFactory.document({
        account: accountDocument,
        transferAccount: transferAccountDocument,
      });

      const invertedTransferTransactionDocument = transferTransactionDataFactory.document({
        account: transferAccountDocument,
        transferAccount: accountDocument,
      });
      const loanTransferTransactionDocument = loanTransferTransactionDataFactory.document({
        account: accountDocument,
        transferAccount: loanAccountDocument,
      });

      const invertedLoanTransferTransactionDocument = loanTransferTransactionDataFactory.document({
        account: loanAccountDocument,
        transferAccount: accountDocument,
      });

      const payingDeferredTransactionDocument = deferredTransactionDataFactory.document({
        account: accountDocument,
        loanAccount: loanAccountDocument,
      });

      const owningDeferredTransactionDocument = deferredTransactionDataFactory.document({
        account: transferAccountDocument,
        loanAccount: accountDocument,
      });

      const owningReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
        account: loanAccountDocument,
        loanAccount: accountDocument,
      });

      cy.saveRecipientDocument(recipientDocument)
        .saveAccountDocuments([
          accountDocument,
          loanAccountDocument,
          transferAccountDocument,
        ])
        .saveCategoryDocuments([
          regularCategoryDocument,
          invoiceCategoryDocument,
          inventoryCategoryDocument,
        ])
        .saveProjectDocument(projectDocument)
        .saveProductDocument(productDocument)
        .saveTransactionDocuments([
          paymentTransactionDocument,
          splitTransactionDocument,
          transferTransactionDocument,
          invertedTransferTransactionDocument,
          loanTransferTransactionDocument,
          invertedLoanTransferTransactionDocument,
          payingDeferredTransactionDocument,
          owningDeferredTransactionDocument,
          owningReimbursementTransactionDocument,
        ])
        .authenticate(1)
        .requestGetTransactionListByAccount(getAccountId(accountDocument), {
          pageNumber: 1,
          pageSize: 100000,
        })
        .expectOkResponse()
        // .expectValidResponseSchema(schema)
        .validateTransactionListResponse([
          paymentTransactionDocument,
          splitTransactionDocument,
          transferTransactionDocument,
          invertedTransferTransactionDocument,
          loanTransferTransactionDocument,
          invertedLoanTransferTransactionDocument,
          payingDeferredTransactionDocument,
          owningDeferredTransactionDocument,
          owningReimbursementTransactionDocument,
        ], getAccountId(accountDocument));
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
