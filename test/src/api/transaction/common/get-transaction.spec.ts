import { Account, Category, Product, Project, Recipient } from '@household/shared/types/types';
import { default as paymentTransactionSchema } from '@household/test/schemas/transaction-payment-response';
import { default as deferredTransactionSchema } from '@household/test/schemas/transaction-deferred-response';
import { default as reimbursementTransactionSchema } from '@household/test/schemas/transaction-reimbursement-response';
import { default as transferTransactionSchema } from '@household/test/schemas/transaction-transfer-response';
import { default as splitTransactionSchema } from '@household/test/schemas/transaction-split-response';
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
  let accountDocument: Account.Document;
  let loanAccountDocument: Account.Document;
  let transferAccountDocument: Account.Document;
  let projectDocument: Project.Document;
  let recipientDocument: Recipient.Document;
  let regularCategoryDocument: Category.Document;
  let inventoryCategoryDocument: Category.Document;
  let invoiceCategoryDocument: Category.Document;
  let productDocument: Product.Document;

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
              expect(res).toMatchSchema(paymentTransactionSchema);
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
              expect(res).toMatchSchema(paymentTransactionSchema);
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
              expect(res).toMatchSchema(paymentTransactionSchema);
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
              expect(res).toMatchSchema(deferredTransactionSchema);
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
              expect(res).toMatchSchema(deferredTransactionSchema);
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
              expect(res).toMatchSchema(deferredTransactionSchema);
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
              expect(res).toMatchSchema(deferredTransactionSchema);
              expect(res).toMatchDeferredTransactionDocument(document);
            });

            test('paying deferred transaction which has been repaid', async ({ requestGetTransaction, saveAccounts, saveTransactions, saveCategory, saveProject, saveRecipient }) => {
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

              await saveAccounts(accountDocument, transferAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransactions(document, repayingTransferTransactionDocument);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(deferredTransactionSchema);
              expect(res).toMatchDeferredTransactionDocument(document, repayingTransferTransactionDocument.payments[0].amount);
            });

            test('owning deferred transaction which has been repaid', async ({ requestGetTransaction, saveAccounts, saveTransactions, saveCategory, saveProject, saveRecipient }) => {
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

              await saveAccounts(accountDocument, transferAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransactions(document, repayingTransferTransactionDocument);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(deferredTransactionSchema);
              expect(res).toMatchDeferredTransactionDocument(document, repayingTransferTransactionDocument.payments[0].amount);
            });

            test('paying deferred transaction which has been settled', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
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

              await saveAccounts(accountDocument, transferAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(deferredTransactionSchema);
              expect(res).toMatchDeferredTransactionDocument(document);
            });

            test('owning deferred transaction which has been settled', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
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

              await saveAccounts(accountDocument, transferAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(deferredTransactionSchema);
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
              expect(res).toMatchSchema(reimbursementTransactionSchema);
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
              expect(res).toMatchSchema(reimbursementTransactionSchema);
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
              expect(res).toMatchSchema(reimbursementTransactionSchema);
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
              expect(res).toMatchSchema(reimbursementTransactionSchema);
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

              await saveAccounts(accountDocument, loanAccountDocument, transferAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProduct(productDocument);
              await saveTransactions(document, repayingTransferTransactionDocument);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(splitTransactionSchema);
              expect(res).toMatchSplitTransactionDocument(document, {
                [getTransactionId(lastDeferredSplit)]: repayingTransferTransactionDocument.payments[0].amount, 
              });
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

              await saveAccounts(accountDocument, transferAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveTransactions(document, repayingTransferTransactionDocument);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(splitTransactionSchema);
              expect(res).toMatchSplitTransactionDocument(document, {
                [getTransactionId(lastDeferredSplit)]: repayingTransferTransactionDocument.payments[0].amount, 
              });
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
                transactions: [deferredTransactionDocument],
              });

              await saveAccounts(accountDocument, transferAccountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransactions(document, deferredTransactionDocument);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(transferTransactionSchema);
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
              expect(res).toMatchSchema(transferTransactionSchema);
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
              expect(res).toMatchSchema(deferredTransactionSchema);
              expect(res).toMatchDeferredTransactionDocument(document);
            });

            test('owning deferred transaction which has been repaid', async ({ requestGetTransaction, saveAccounts, saveTransactions, saveCategory, saveProject, saveRecipient }) => {
              const document = deferredTransactionDataFactory.document({
                body: {
                  amount: -5000,
                },
                account: accountDocument,
                category: regularCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                loanAccount: loanAccountDocument,
              });

              const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
                account: accountDocument,
                transferAccount: transferAccountDocument,
                body: {
                  amount: -1500,
                },
                transactions: [document],
              });

              await saveAccounts(accountDocument, loanAccountDocument, transferAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransactions(document, repayingTransferTransactionDocument);
              const res = await requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(deferredTransactionSchema);
              expect(res).toMatchDeferredTransactionDocument(document, repayingTransferTransactionDocument.payments[0].amount);
            });

            test('owning deferred transaction which has been settled', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = deferredTransactionDataFactory.document({
                body: {
                  isSettled: true,
                },
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
              expect(res).toMatchSchema(deferredTransactionSchema);
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
              expect(res).toMatchSchema(reimbursementTransactionSchema);
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
              expect(res).toMatchSchema(reimbursementTransactionSchema);
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
              expect(res).toMatchSchema(reimbursementTransactionSchema);
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
                  {
                    loanAccount: loanAccountDocument,
                    isSettled: true,
                  },
                  {
                    loanAccount: loanAccountDocument,
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

              await saveAccounts(accountDocument, loanAccountDocument, transferAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveTransactions(document, repayingTransferTransactionDocument);
              const res = await requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document));
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(splitTransactionSchema);
              expect(res).toMatchSplitTransactionDocument(document, {
                [getTransactionId(lastDeferredSplit)]: repayingTransferTransactionDocument.payments[0].amount, 
              });
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
              expect(res).toMatchSchema(transferTransactionSchema);
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
