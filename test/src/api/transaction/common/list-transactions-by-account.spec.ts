import { default as schema } from '@household/test/api/schemas/transaction-response-list';
import { Account } from '@household/shared/types/types';
import { createAccountId } from '@household/shared/common/test-data-factory';
import { getAccountId, getTransactionId } from '@household/shared/common/utils';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { AccountType, CategoryType } from '@household/shared/enums';

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

    describe('should get a list of transactions', () => {
      it('of a non-loan account', () => {
        const loanAccountDocument = accountDataFactory.document({
          accountType: AccountType.Loan,
        });
        const transferAccountDocument = accountDataFactory.document();
        const projectDocument = projectDataFactory.document();
        const recipientDocument = recipientDataFactory.document();
        const regularCategoryDocument = categoryDataFactory.document({
          body: {
            categoryType: CategoryType.Regular,
          },
        });
        const inventoryCategoryDocument = categoryDataFactory.document({
          body: {
            categoryType: CategoryType.Inventory,
          },
        });
        const invoiceCategoryDocument = categoryDataFactory.document({
          body: {
            categoryType: CategoryType.Invoice,
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

        const payingSplitTransactionDocument = splitTransactionDataFactory.document({
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
              loanAccount: loanAccountDocument,
            },
            {
              loanAccount: loanAccountDocument,
              isSettled: true,
            },
            {
              loanAccount: loanAccountDocument,
            },
          ],
        });

        const owningSplitTransactionDocument = splitTransactionDataFactory.document({
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
            },
          ],
        });

        const payingNotRepayedDeferredTransactionDocument = deferredTransactionDataFactory.document({
          account: accountDocument,
          loanAccount: loanAccountDocument,
        });

        const payingRepayedDeferredTransactionDocument = deferredTransactionDataFactory.document({
          account: accountDocument,
          loanAccount: loanAccountDocument,
        });

        const payingSettledDeferredTransactionDocument = deferredTransactionDataFactory.document({
          account: accountDocument,
          loanAccount: loanAccountDocument,
          body: {
            isSettled: true,
          },
        });

        const owningNotRepayedDeferredTransactionDocument = deferredTransactionDataFactory.document({
          account: transferAccountDocument,
          loanAccount: accountDocument,
        });

        const owningRepayedDeferredTransactionDocument = deferredTransactionDataFactory.document({
          account: transferAccountDocument,
          loanAccount: accountDocument,
        });

        const owningSettledDeferredTransactionDocument = deferredTransactionDataFactory.document({
          account: transferAccountDocument,
          loanAccount: accountDocument,
          body: {
            isSettled: true,
          },
        });

        const owningReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
          account: loanAccountDocument,
          loanAccount: accountDocument,
        });

        const payingTransferTransactionDocument = transferTransactionDataFactory.document({
          account: accountDocument,
          transferAccount: transferAccountDocument,
          transactions: [
            owningRepayedDeferredTransactionDocument,
            owningSplitTransactionDocument.deferredSplits[2],
          ],
        });

        const receivingTransferTransactionDocument = transferTransactionDataFactory.document({
          account: transferAccountDocument,
          transferAccount: accountDocument,
          transactions: [
            payingRepayedDeferredTransactionDocument,
            payingSplitTransactionDocument.deferredSplits[2],
          ],
        });
        const loanTransferTransactionDocument = transferTransactionDataFactory.document({
          account: accountDocument,
          transferAccount: loanAccountDocument,
        });

        const invertedLoanTransferTransactionDocument = transferTransactionDataFactory.document({
          account: loanAccountDocument,
          transferAccount: accountDocument,
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
            payingSplitTransactionDocument,
            owningSplitTransactionDocument,
            payingTransferTransactionDocument,
            receivingTransferTransactionDocument,
            loanTransferTransactionDocument,
            invertedLoanTransferTransactionDocument,
            payingNotRepayedDeferredTransactionDocument,
            payingRepayedDeferredTransactionDocument,
            payingSettledDeferredTransactionDocument,
            owningNotRepayedDeferredTransactionDocument,
            owningRepayedDeferredTransactionDocument,
            owningSettledDeferredTransactionDocument,
            owningReimbursementTransactionDocument,
          ])
          .authenticate(1)
          .requestGetTransactionListByAccount(getAccountId(accountDocument), {
            pageNumber: 1,
            pageSize: 100000,
          })
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListResponse([
            paymentTransactionDocument,
            payingSplitTransactionDocument,
            owningSplitTransactionDocument,
            payingTransferTransactionDocument,
            receivingTransferTransactionDocument,
            loanTransferTransactionDocument,
            invertedLoanTransferTransactionDocument,
            payingNotRepayedDeferredTransactionDocument,
            payingRepayedDeferredTransactionDocument,
            payingSettledDeferredTransactionDocument,
            owningNotRepayedDeferredTransactionDocument,
            owningRepayedDeferredTransactionDocument,
            owningSettledDeferredTransactionDocument,
            owningReimbursementTransactionDocument,
          ], getAccountId(accountDocument), {
            [getTransactionId(owningRepayedDeferredTransactionDocument)]: payingTransferTransactionDocument.payments[0].amount,
            [getTransactionId(owningSplitTransactionDocument.deferredSplits[2])]: payingTransferTransactionDocument.payments[1].amount,
            [getTransactionId(payingRepayedDeferredTransactionDocument)]: receivingTransferTransactionDocument.payments[0].amount,
            [getTransactionId(payingSplitTransactionDocument.deferredSplits[2])]: receivingTransferTransactionDocument.payments[1].amount,
          });
      });

      it('of a loan account', () => {
        const loanAccountDocument = accountDataFactory.document({
          accountType: AccountType.Loan,
        });
        const transferAccountDocument = accountDataFactory.document();
        const projectDocument = projectDataFactory.document();
        const recipientDocument = recipientDataFactory.document();
        const regularCategoryDocument = categoryDataFactory.document({
          body: {
            categoryType: CategoryType.Regular,
          },
        });
        const inventoryCategoryDocument = categoryDataFactory.document({
          body: {
            categoryType: CategoryType.Inventory,
          },
        });
        const invoiceCategoryDocument = categoryDataFactory.document({
          body: {
            categoryType: CategoryType.Invoice,
          },
        });
        const productDocument = productDataFactory.document({
          category: inventoryCategoryDocument,
        });

        const owningSplitTransactionDocument = splitTransactionDataFactory.document({
          account: accountDocument,
          recipient: recipientDocument,
          splits: [
            {
              project: projectDocument,
            },
            {
              loanAccount: loanAccountDocument,
            },
            {
              loanAccount: loanAccountDocument,
              isSettled: true,
            },
            {
              loanAccount: loanAccountDocument,
            },
          ],
        });

        const owningNotRepayedDeferredTransactionDocument = deferredTransactionDataFactory.document({
          account: accountDocument,
          loanAccount: loanAccountDocument,
        });

        const owningRepayedDeferredTransactionDocument = deferredTransactionDataFactory.document({
          account: accountDocument,
          loanAccount: loanAccountDocument,
        });

        const owningSettledDeferredTransactionDocument = deferredTransactionDataFactory.document({
          account: accountDocument,
          loanAccount: loanAccountDocument,
          body: {
            isSettled: true,
          },
        });

        const payingReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
          account: loanAccountDocument,
          loanAccount: accountDocument,
        });

        const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
          account: accountDocument,
          transferAccount: transferAccountDocument,
          transactions: [
            owningRepayedDeferredTransactionDocument,
            owningSplitTransactionDocument.deferredSplits[2],
          ],
        });

        const loanTransferTransactionDocument = transferTransactionDataFactory.document({
          account: accountDocument,
          transferAccount: loanAccountDocument,
        });

        const invertedLoanTransferTransactionDocument = transferTransactionDataFactory.document({
          account: loanAccountDocument,
          transferAccount: accountDocument,
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
            owningSplitTransactionDocument,
            repayingTransferTransactionDocument,
            loanTransferTransactionDocument,
            invertedLoanTransferTransactionDocument,
            owningNotRepayedDeferredTransactionDocument,
            owningRepayedDeferredTransactionDocument,
            owningSettledDeferredTransactionDocument,
            payingReimbursementTransactionDocument,
          ])
          .authenticate(1)
          .requestGetTransactionListByAccount(getAccountId(loanAccountDocument), {
            pageNumber: 1,
            pageSize: 100000,
          })
          .expectOkResponse()
          .expectValidResponseSchema(schema)
          .validateTransactionListResponse([
            owningSplitTransactionDocument,
            loanTransferTransactionDocument,
            invertedLoanTransferTransactionDocument,
            owningNotRepayedDeferredTransactionDocument,
            owningRepayedDeferredTransactionDocument,
            owningSettledDeferredTransactionDocument,
            payingReimbursementTransactionDocument,
          ], getAccountId(loanAccountDocument), {
            [getTransactionId(owningRepayedDeferredTransactionDocument)]: repayingTransferTransactionDocument.payments[0].amount,
            [getTransactionId(owningSplitTransactionDocument.deferredSplits[2])]: repayingTransferTransactionDocument.payments[1].amount,
          });
      });
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
