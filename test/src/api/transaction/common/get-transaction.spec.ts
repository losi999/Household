
import { Documents } from '@household/shared/types/documents';
import { paymentResponse, deferredResponse, reimbursementResponse, transferResponse, splitResponse } from '@household/shared/schemas/transaction';
import { entries, getAccountId, getTransactionId } from '@household/shared/common/utils';
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
import { AccountType, CategoryType } from '@household/shared/enums';
import { forbidUsers } from '@household/test/utils';

import { test as transactionApiTest, expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { test as transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { test as categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { test as projectDbTest } from '@household/test/fixtures/project-db.fixture';
import { test as recipientDbTest } from '@household/test/fixtures/recipient-db.fixture';
import { test as productDbTest } from '@household/test/fixtures/product-db.fixture';

const expect = mergeExpects(transactionApiExpect, apiExpect);

const permissionMap = forbidUsers();

const test = mergeTests(transactionApiTest, accountDbTest, transactionDbTest, categoryDbTest, projectDbTest, recipientDbTest, productDbTest);

test.describe('GET /transaction/v1/accounts/{accountId}/transactions/{transactionId}', () => {
  let accountDocument: Documents.Account;
  let loanAccountDocument: Documents.Account;
  let transferAccountDocument: Documents.Account;
  let projectDocument: Documents.Project;
  let recipientDocument: Documents.Recipient;
  let regularCategoryDocument: Documents.Category;
  let inventoryCategoryDocument: Documents.Category;
  let invoiceCategoryDocument: Documents.Category;
  let productDocument: Documents.Product;

  test.beforeEach(async () => {
    accountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: AccountType.Loan,
    });
    transferAccountDocument = accountDataFactory.document();

    recipientDocument = recipientDataFactory.document();

    projectDocument = projectDataFactory.document();

    regularCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Regular,
      },
    });

    inventoryCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });

    invoiceCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Invoice,
      },
    });

    productDocument = productDataFactory.document({
      category: inventoryCategoryDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestGetTransaction }) => {
      const res = await requestGetTransaction(getAccountId(accountDocument), paymentTransactionDataFactory.id());
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
        test('should return forbidden', async ({ requestGetTransaction }) => {
          const res = await requestGetTransaction(getAccountId(accountDocument), paymentTransactionDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should get', () => {
          test.describe('of a non-loan account', () => {
            test('regular payment transaction', async ({ requestGetTransaction, saveAccount, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = paymentTransactionDataFactory.document({
                account: accountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
              });

              await saveAccount(accountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(paymentResponse);
              expect(res).toMatchPaymentTransactionDocument(document);
            });

            test('inventory payment transaction', async ({ requestGetTransaction, saveAccount, saveTransaction, saveCategory, saveProject, saveRecipient, saveProduct }) => {
              const document = paymentTransactionDataFactory.document({
                account: accountDocument,
                category: inventoryCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                product: productDocument,
              });

              await saveAccount(accountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProduct(productDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(paymentResponse);
              expect(res).toMatchPaymentTransactionDocument(document);
            });

            test('invoice payment transaction', async ({ requestGetTransaction, saveAccount, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = paymentTransactionDataFactory.document({
                account: accountDocument,
                category: invoiceCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
              });

              await saveAccount(accountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(invoiceCategoryDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(paymentResponse);
              expect(res).toMatchPaymentTransactionDocument(document);
            });

            test('regular deferred transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = deferredTransactionDataFactory.document({
                account: accountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: loanAccountDocument,
              });

              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(deferredResponse);
              expect(res).toMatchDeferredTransactionDocument(document);
            });

            test('inventory deferred transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient, saveProduct }) => {
              const document = deferredTransactionDataFactory.document({
                account: accountDocument,
                category: inventoryCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                product: productDocument,
                loanAccount: loanAccountDocument,
              });

              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProduct(productDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(deferredResponse);
              expect(res).toMatchDeferredTransactionDocument(document);
            });

            test('invoice deferred transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = deferredTransactionDataFactory.document({
                account: accountDocument,
                category: invoiceCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: loanAccountDocument,
              });

              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(invoiceCategoryDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(deferredResponse);
              expect(res).toMatchDeferredTransactionDocument(document);
            });

            test('owning deferred transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = deferredTransactionDataFactory.document({
                account: transferAccountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: accountDocument,
              });

              await saveAccounts(accountDocument, transferAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(deferredResponse);
              expect(res).toMatchDeferredTransactionDocument(document);
            });

            test('regular owning reimbursement transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: accountDocument,
              });

              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(reimbursementResponse);
              expect(res).toMatchReimbursementTransactionDocument(document);
            });

            test('regular paying reimbursement transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: accountDocument,
              });

              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(reimbursementResponse);
              expect(res).toMatchReimbursementTransactionDocument(document);
            });

            test('inventory reimbursement transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient, saveProduct }) => {
              const document = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: inventoryCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                product: productDocument,
                loanAccount: accountDocument,
              });

              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProduct(productDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(reimbursementResponse);
              expect(res).toMatchReimbursementTransactionDocument(document);
            });

            test('invoice reimbursement transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: invoiceCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: accountDocument,
              });

              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(invoiceCategoryDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(reimbursementResponse);
              expect(res).toMatchReimbursementTransactionDocument(document);
            });

            test('paying split transaction', async ({ requestGetTransaction, saveAccounts, saveTransactions, saveCategories, saveProject, saveRecipient, saveProduct }) => {
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
                ],
                loans: [
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

              await saveAccounts(accountDocument, loanAccountDocument, transferAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProduct(productDocument);
              await saveTransactions(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(splitResponse);
              expect(res).toMatchSplitTransactionDocument(document);
            });

            test('owning split transaction', async ({ requestGetTransaction, saveAccounts, saveTransactions, saveProject, saveRecipient }) => {
              const document = splitTransactionDataFactory.document({
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
                ],
              });

              await saveAccounts(accountDocument, transferAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveTransactions(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(splitResponse);
              expect(res).toMatchSplitTransactionDocument(document);
            });

            test('transfer transaction', async ({ requestGetTransaction, saveAccounts, saveTransactions, saveCategory, saveProject, saveRecipient }) => {
              const deferredTransactionDocument = deferredTransactionDataFactory.document({
                account: transferAccountDocument,
                loanAccount: loanAccountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
              });

              const document = transferTransactionDataFactory.document({
                account: accountDocument,
                transferAccount: transferAccountDocument,
              });

              await saveAccounts(accountDocument, transferAccountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransactions(document, deferredTransactionDocument);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(transferResponse);
              expect(res).toMatchTransferTransactionDocument(document, getAccountId(accountDocument));
            });

            test('loan transfer transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction }) => {
              const document = transferTransactionDataFactory.document({
                account: loanAccountDocument,
                transferAccount: transferAccountDocument,
              });

              await saveAccounts(loanAccountDocument, transferAccountDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(transferResponse);
              expect(res).toMatchTransferTransactionDocument(document, getAccountId(loanAccountDocument));
            });
          });

          test.describe('of a loan account', () => {
            test('owning deferred transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = deferredTransactionDataFactory.document({
                account: accountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: loanAccountDocument,
              });

              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(deferredResponse);
              expect(res).toMatchDeferredTransactionDocument(document);
            });

            test('regular reimbursement transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: accountDocument,
              });

              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(reimbursementResponse);
              expect(res).toMatchReimbursementTransactionDocument(document);
            });

            test('inventory reimbursement transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient, saveProduct }) => {
              const document = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: inventoryCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                product: productDocument,
                loanAccount: accountDocument,
              });

              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProduct(productDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(reimbursementResponse);
              expect(res).toMatchReimbursementTransactionDocument(document);
            });

            test('invoice reimbursement transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: invoiceCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: accountDocument,
              });

              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(invoiceCategoryDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(reimbursementResponse);
              expect(res).toMatchReimbursementTransactionDocument(document);
            });

            test('owning split transaction', async ({ requestGetTransaction, saveAccounts, saveTransactions, saveProject, saveRecipient }) => {
              const document = splitTransactionDataFactory.document({
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
                ],
              });

              await saveAccounts(accountDocument, loanAccountDocument, transferAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveTransactions(document);
              const res = await requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(splitResponse);
              expect(res).toMatchSplitTransactionDocument(document);
            });

            test('loan transfer transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction }) => {
              const document = transferTransactionDataFactory.document({
                account: loanAccountDocument,
                transferAccount: transferAccountDocument,
              });

              await saveAccounts(loanAccountDocument, transferAccountDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(transferResponse);
              expect(res).toMatchTransferTransactionDocument(document, getAccountId(loanAccountDocument));
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if transactionId', () => {
            test('is not mongo id', async ({ requestGetTransaction }) => {
              const res = await requestGetTransaction(accountDataFactory.id(), paymentTransactionDataFactory.id('not-valid'));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'transactionId');
            });

            test('does not belong to any transaction', async ({ requestGetTransaction }) => {
              const res = await requestGetTransaction(accountDataFactory.id(), paymentTransactionDataFactory.id());
              expect(res).toBeNotFoundResponse();
            });
          });

          test.describe('if accountId', () => {
            test('is not mongo id', async ({ requestGetTransaction }) => {
              const res = await requestGetTransaction(accountDataFactory.id('not-valid'), paymentTransactionDataFactory.id());
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'accountId');
            });
          });
        });
      }
    });
  });
});
