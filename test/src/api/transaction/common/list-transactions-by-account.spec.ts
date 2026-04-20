import { default as schema } from '@household/test/schemas/transaction-response-list';
import { Account } from '@household/shared/types/types';
import { createAccountId } from '@household/shared/common/test-data-factory';
import { entries, getAccountId, getTransactionId } from '@household/shared/common/utils';
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
import { forbidUsers } from '@household/test/utils';

import { test, expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { accountService, categoryService, productService, projectService, recipientService, transactionService } from '@household/test/dependencies';

const expect = mergeExpects(transactionApiExpect, apiExpect);

const permissionMap = forbidUsers();

test.describe('GET /transaction/v1/accounts/{accountId}/transactions', () => {
  let accountDocument: Account.Document;

  test.beforeEach(async () => {
    accountDocument = accountDataFactory.document();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestGetTransactionListByAccount }) => {
      const res = await requestGetTransactionListByAccount(getAccountId(accountDocument));
      expect(res).toBeUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    test.describe(`called as ${userType}`, () => {
      test.use({
        userType: userType, 
      });
      if (!isAllowed) {
        test('should return forbidden', async ({ requestGetTransactionListByAccount }) => {
          const res = await requestGetTransactionListByAccount(getAccountId(accountDocument));
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should get a list of transactions', () => {
          test('of a non-loan account', async ({ requestGetTransactionListByAccount }) => {
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
              ],
              loans: [
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
              ],
              loans: [
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

            const payingNotRepaidDeferredTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              loanAccount: loanAccountDocument,
            });

            const payingRepaidDeferredTransactionDocument = deferredTransactionDataFactory.document({
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

            const owningNotRepaidDeferredTransactionDocument = deferredTransactionDataFactory.document({
              account: transferAccountDocument,
              loanAccount: accountDocument,
            });

            const owningRepaidDeferredTransactionDocument = deferredTransactionDataFactory.document({
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
                owningRepaidDeferredTransactionDocument,
                owningSplitTransactionDocument.deferredSplits[2],
              ],
            });

            const receivingTransferTransactionDocument = transferTransactionDataFactory.document({
              account: transferAccountDocument,
              transferAccount: accountDocument,
              transactions: [
                payingRepaidDeferredTransactionDocument,
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

            await recipientService.saveRecipient(recipientDocument);
            await accountService.saveAccounts(accountDocument, loanAccountDocument, transferAccountDocument);
            await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
            await projectService.saveProject(projectDocument);
            await productService.saveProduct(productDocument);
            await transactionService.saveTransactions(paymentTransactionDocument, payingSplitTransactionDocument, owningSplitTransactionDocument, payingTransferTransactionDocument, receivingTransferTransactionDocument, loanTransferTransactionDocument, invertedLoanTransferTransactionDocument, payingNotRepaidDeferredTransactionDocument, payingRepaidDeferredTransactionDocument, payingSettledDeferredTransactionDocument, owningNotRepaidDeferredTransactionDocument, owningRepaidDeferredTransactionDocument, owningSettledDeferredTransactionDocument, owningReimbursementTransactionDocument);
            const res = await requestGetTransactionListByAccount(getAccountId(accountDocument), {
              pageNumber: 1,
              pageSize: 100000, 
            });
            expect(res).toBeOkResponse();
            expect(res).toMatchSchema(schema);
            // TODO: validateTransactionListResponse([ paymentTransactionDocument, payingSplitTransactionDocument, owningSplitTransactionDocument, payingTransferTransactionDocument, receivingTransferTransactionDocument, loanTransferTransactionDocument, invertedLoanTransferTransactionDocument, payingNotRepaidDeferredTransactionDocument, payingRepaidDeferredTransactionDocument, payingSettledDeferredTransactionDocument, owningNotRepaidDeferredTransactionDocument, owningRepaidDeferredTransactionDocument, owningSettledDeferredTransactionDocument, owningReimbursementTransactionDocument, ], getAccountId(accountDocument), { [getTransactionId(owningRepaidDeferredTransactionDocument)]: payingTransferTransactionDocument.payments[0].amount, [getTransactionId(owningSplitTransactionDocument.deferredSplits[2])]: payingTransferTransactionDocument.payments[1].amount, [getTransactionId(payingRepaidDeferredTransactionDocument)]: receivingTransferTransactionDocument.payments[0].amount, [getTransactionId(payingSplitTransactionDocument.deferredSplits[2])]: receivingTransferTransactionDocument.payments[1].amount, })
          });

          test('of a loan account', async ({ requestGetTransactionListByAccount }) => {
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
              ],
              loans: [
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

            const owningNotRepaidDeferredTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              loanAccount: loanAccountDocument,
            });

            const owningRepaidDeferredTransactionDocument = deferredTransactionDataFactory.document({
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
                owningRepaidDeferredTransactionDocument,
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

            await recipientService.saveRecipient(recipientDocument);
            await accountService.saveAccounts(accountDocument, loanAccountDocument, transferAccountDocument);
            await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
            await projectService.saveProject(projectDocument);
            await productService.saveProduct(productDocument);
            await transactionService.saveTransactions(owningSplitTransactionDocument, repayingTransferTransactionDocument, loanTransferTransactionDocument, invertedLoanTransferTransactionDocument, owningNotRepaidDeferredTransactionDocument, owningRepaidDeferredTransactionDocument, owningSettledDeferredTransactionDocument, payingReimbursementTransactionDocument);
            const res = await requestGetTransactionListByAccount(getAccountId(loanAccountDocument), {
              pageNumber: 1,
              pageSize: 100000, 
            });
            expect(res).toBeOkResponse();
            expect(res).toMatchSchema(schema);
            // TODO: validateTransactionListResponse([ owningSplitTransactionDocument, loanTransferTransactionDocument, invertedLoanTransferTransactionDocument, owningNotRepaidDeferredTransactionDocument, owningRepaidDeferredTransactionDocument, owningSettledDeferredTransactionDocument, payingReimbursementTransactionDocument, ], getAccountId(loanAccountDocument), { [getTransactionId(owningRepaidDeferredTransactionDocument)]: repayingTransferTransactionDocument.payments[0].amount, [getTransactionId(owningSplitTransactionDocument.deferredSplits[2])]: repayingTransferTransactionDocument.payments[1].amount, })
          });
        });

        test.describe('should return error', () => {
          test.describe('if accountId', () => {
            test('is not mongo id', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(createAccountId('not-mongo-id'));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'accountId');
            });
          });

          test.describe('if querystring', () => {
            test('has additional parameter', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(createAccountId(), {
                pageNumber: 1,
                pageSize: 100,
                extra: 1, 
              } as any);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('queryStringParameters', 'data', 'extra');
            });
          });

          test.describe('if querystring.pageSize', () => {
            test('is missing while pageNumber is set', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(createAccountId(), {
                pageNumber: 1, 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('queryStringParameters', 'pageSize');
            });

            test('is not number', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(createAccountId(), {
                pageNumber: 1,
                pageSize: 'asd' as any, 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('queryStringParameters', 'pageSize');
            });

            test('is too small', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(createAccountId(), {
                pageNumber: 1,
                pageSize: 0, 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('queryStringParameters', 'pageSize');
            });
          });

          test.describe('if querystring.pageNumber', () => {
            test('is missing while pageSize is set', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(createAccountId(), {
                pageSize: 1, 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('queryStringParameters', 'pageNumber');
            });

            test('is not number', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(createAccountId(), {
                pageNumber: 'asd' as any,
                pageSize: 1, 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('queryStringParameters', 'pageNumber');
            });

            test('is too small', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(createAccountId(), {
                pageNumber: 0,
                pageSize: 1, 
              });
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('queryStringParameters', 'pageNumber');
            });
          });
        });
      }
    });
  });
});
