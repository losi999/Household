import { responseList as schema } from '@household/shared/schemas/transaction';
import { Documents } from '@household/shared/types/documents';
import { entries, getAccountId } from '@household/shared/common/utils';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { loanTransactionDataFactory } from '@household/test/api/transaction/loan/loan-data-factory';
import { AccountType, CategoryType } from '@household/shared/enums';
import { forbidUsers } from '@household/test/utils';

import { transactionApiTest, transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { mergeTests } from '@playwright/test';
import { accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { projectDbTest } from '@household/test/fixtures/project-db.fixture';
import { recipientDbTest } from '@household/test/fixtures/recipient-db.fixture';
import { productDbTest } from '@household/test/fixtures/product-db.fixture';

const permissionMap = forbidUsers();

const test = mergeTests(transactionApiTest, accountDbTest, transactionDbTest, categoryDbTest, projectDbTest, recipientDbTest, productDbTest);

test.describe('GET /transaction/v1/accounts/{accountId}/transactions', () => {
  let accountDocument: Documents.Account;

  test.beforeEach(async () => {
    accountDocument = accountDataFactory.document();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestGetTransactionListByAccount }) => {
      const res = await requestGetTransactionListByAccount(getAccountId(accountDocument));
      transactionApiExpect(res).toBeUnauthorizedResponse();
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
          transactionApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should get a list of transactions', () => {
          test('of a non-loan account', async ({ requestGetTransactionListByAccount, saveAccounts, saveTransactions, saveCategories, saveProject, saveRecipient, saveProducts }) => {
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
            const childCategoryDocument = categoryDataFactory.document({
              body: {
                categoryType: CategoryType.Regular,
              },
              parentCategory: regularCategoryDocument,
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
            const genericProductDocument = productDataFactory.document.generic();
            const specificProductDocument = productDataFactory.document.specific({
              genericProduct: genericProductDocument,
            });
            const variantProductDocument = productDataFactory.document.variant({
              specificProduct: specificProductDocument,
              genericProduct: genericProductDocument,
            });

            const paymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
              recipient: recipientDocument,
              project: projectDocument,
              category: inventoryCategoryDocument,
              product: specificProductDocument,
            });

            const splitTransactionDocument = splitTransactionDataFactory.document({
              account: accountDocument,
              recipient: recipientDocument,
              splits: [
                {
                  project: projectDocument,
                  category: inventoryCategoryDocument,
                  product: variantProductDocument,
                },
                {
                  category: childCategoryDocument,
                },

                {
                  category: inventoryCategoryDocument,
                  product: genericProductDocument,
                },
                {
                  category: invoiceCategoryDocument,
                },
              ],
              loans: [
                {
                  loanAccount: loanAccountDocument,
                  category: childCategoryDocument,
                },
                {
                  loanAccount: loanAccountDocument,
                },
              ],
            });

            const loanTransactionDocument = loanTransactionDataFactory.document({
              account: accountDocument,
              loanAccount: loanAccountDocument,
              category: childCategoryDocument,
            });

            const repaymentTransactionDocument = loanTransactionDataFactory.document({
              account: loanAccountDocument,
              loanAccount: accountDocument,
            });

            const payingTransferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: transferAccountDocument,
            });

            const receivingTransferTransactionDocument = transferTransactionDataFactory.document({
              account: transferAccountDocument,
              transferAccount: accountDocument,
            });
            const loanTransferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: loanAccountDocument,
            });

            const invertedLoanTransferTransactionDocument = transferTransactionDataFactory.document({
              account: loanAccountDocument,
              transferAccount: accountDocument,
            });

            await saveRecipient(recipientDocument);
            await saveAccounts(accountDocument, loanAccountDocument, transferAccountDocument);
            await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument, childCategoryDocument);
            await saveProject(projectDocument);
            await saveProducts(genericProductDocument, specificProductDocument, variantProductDocument);
            await saveTransactions(paymentTransactionDocument, splitTransactionDocument, payingTransferTransactionDocument, receivingTransferTransactionDocument, loanTransferTransactionDocument, invertedLoanTransferTransactionDocument, loanTransactionDocument, repaymentTransactionDocument);
            const res = await requestGetTransactionListByAccount(getAccountId(accountDocument), {
              pageNumber: 1,
              pageSize: 100000, 
            });
            transactionApiExpect(res).toBeOkResponse();
            transactionApiExpect(res).toMatchSchema(schema);
            transactionApiExpect(res).toContainMatchingPaymentTransactionDocument(paymentTransactionDocument);

            transactionApiExpect(res).toContainMatchingSplitTransactionDocument(splitTransactionDocument);

            transactionApiExpect(res).toContainMatchingTransferTransactionDocument(payingTransferTransactionDocument, getAccountId(accountDocument));
            transactionApiExpect(res).toContainMatchingTransferTransactionDocument(receivingTransferTransactionDocument, getAccountId(accountDocument));
            transactionApiExpect(res).toContainMatchingTransferTransactionDocument(loanTransferTransactionDocument, getAccountId(accountDocument));
            transactionApiExpect(res).toContainMatchingTransferTransactionDocument(invertedLoanTransferTransactionDocument, getAccountId(accountDocument));

            transactionApiExpect(res).toContainMatchingLoanTransactionDocument(loanTransactionDocument);            
            transactionApiExpect(res).toNotContainMatchingLoanTransactionDocument(repaymentTransactionDocument);
          });

          test('of a loan account', async ({ requestGetTransactionListByAccount, saveAccounts, saveTransactions, saveCategories, saveProject, saveRecipient, saveProduct }) => {
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
            const productDocument = productDataFactory.document.generic();

            const loanSplitTransactionDocument = splitTransactionDataFactory.document({
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
                },
              ],
            });

            const loanTransactionDocument = loanTransactionDataFactory.document({
              account: accountDocument,
              loanAccount: loanAccountDocument,
            });

            const repaymentTransactionDocument = loanTransactionDataFactory.document({
              account: loanAccountDocument,
              loanAccount: accountDocument,
            });

            const loanTransferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: loanAccountDocument,
            });

            const invertedLoanTransferTransactionDocument = transferTransactionDataFactory.document({
              account: loanAccountDocument,
              transferAccount: accountDocument,
            });

            await saveRecipient(recipientDocument);
            await saveAccounts(accountDocument, loanAccountDocument, transferAccountDocument);
            await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
            await saveProject(projectDocument);
            await saveProduct(productDocument);
            await saveTransactions(loanSplitTransactionDocument, loanTransferTransactionDocument, invertedLoanTransferTransactionDocument, loanTransactionDocument, repaymentTransactionDocument);
            const res = await requestGetTransactionListByAccount(getAccountId(loanAccountDocument), {
              pageNumber: 1,
              pageSize: 100000, 
            });
            transactionApiExpect(res).toBeOkResponse();
            transactionApiExpect(res).toMatchSchema(schema);

            transactionApiExpect(res).toContainMatchingSplitTransactionDocument(loanSplitTransactionDocument);

            transactionApiExpect(res).toContainMatchingTransferTransactionDocument(loanTransferTransactionDocument, getAccountId(loanAccountDocument));
            transactionApiExpect(res).toContainMatchingTransferTransactionDocument(invertedLoanTransferTransactionDocument, getAccountId(loanAccountDocument));
            
            transactionApiExpect(res).toContainMatchingLoanTransactionDocument(loanTransactionDocument);
            transactionApiExpect(res).toContainMatchingLoanTransactionDocument(repaymentTransactionDocument);
          });
        });

        test.describe('should return error', () => {
          test.describe('if accountId', () => {
            test('is not mongo id', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(accountDataFactory.id('not-mongo-id'));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('pathParameters', 'accountId');
            });
          });

          test.describe('if querystring', () => {
            test('has additional parameter', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(accountDataFactory.id(), {
                pageNumber: 1,
                pageSize: 100,
                extra: 1, 
              } as any);
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveAdditionalPropertiesValidationError('queryStringParameters', 'data', 'extra');
            });
          });

          test.describe('if querystring.pageSize', () => {
            test('is missing while pageNumber is set', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(accountDataFactory.id(), {
                pageNumber: 1, 
              });
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveDependentRequiredPropertyValidationError('queryStringParameters', 'pageNumber', 'pageSize');
            });

            test('is not number', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(accountDataFactory.id(), {
                pageNumber: 1,
                pageSize: 'asd' as any, 
              });
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('queryStringParameters', 'pageSize');
            });

            test('is too small', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(accountDataFactory.id(), {
                pageNumber: 1,
                pageSize: 0, 
              });
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('queryStringParameters', 'pageSize');
            });
          });

          test.describe('if querystring.pageNumber', () => {
            test('is missing while pageSize is set', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(accountDataFactory.id(), {
                pageSize: 1, 
              });
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveDependentRequiredPropertyValidationError('queryStringParameters', 'pageSize', 'pageNumber');
            });

            test('is not number', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(accountDataFactory.id(), {
                pageNumber: 'asd' as any,
                pageSize: 1, 
              });
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('queryStringParameters', 'pageNumber');
            });

            test('is too small', async ({ requestGetTransactionListByAccount }) => {
              const res = await requestGetTransactionListByAccount(accountDataFactory.id(), {
                pageNumber: 0,
                pageSize: 1, 
              });
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('queryStringParameters', 'pageNumber');
            });
          });
        });
      }
    });
  });
});
