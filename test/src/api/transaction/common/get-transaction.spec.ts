
import { Documents } from '@household/shared/types/documents';
import { paymentResponse, loanResponse, transferResponse, splitResponse } from '@household/shared/schemas/transaction';
import { entries, getAccountId, getTransactionId } from '@household/shared/common/utils';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { loanTransactionDataFactory } from '@household/test/api/transaction/loan/loan-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
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

test.describe('GET /transaction/v1/accounts/{accountId}/transactions/{transactionId}', () => {
  let accountDocument: Documents.Account;
  let loanAccountDocument: Documents.Account;
  let transferAccountDocument: Documents.Account;
  let projectDocument: Documents.Project;
  let recipientDocument: Documents.Recipient;
  let regularCategoryDocument: Documents.Category;
  let inventoryCategoryDocument: Documents.Category;
  let invoiceCategoryDocument: Documents.Category;
  let childCategoryDocument: Documents.Category;
  let genericProductDocument: Documents.GenericProduct;
  let specificProductDocument: Documents.SpecificProduct;
  let variantProductDocument: Documents.VariantProduct;

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

    childCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Regular,
      },
      parentCategory: regularCategoryDocument,
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

    genericProductDocument = productDataFactory.document.generic();
    specificProductDocument = productDataFactory.document.specific({
      genericProduct: genericProductDocument,
    });
    variantProductDocument = productDataFactory.document.variant({
      genericProduct: genericProductDocument,
      specificProduct: specificProductDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestGetTransaction }) => {
      const res = await requestGetTransaction(getAccountId(accountDocument), paymentTransactionDataFactory.id());
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
        test('should return forbidden', async ({ requestGetTransaction }) => {
          const res = await requestGetTransaction(getAccountId(accountDocument), paymentTransactionDataFactory.id());
          transactionApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should get', () => {
          test.describe('of a non-loan account', () => {
            test('regular payment transaction', async ({ requestGetTransaction, saveAccount, saveTransaction, saveCategories, saveProject, saveRecipient }) => {
              const document = paymentTransactionDataFactory.document({
                account: accountDocument,
                category: childCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
              });

              await saveAccount(accountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategories(childCategoryDocument, regularCategoryDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(paymentResponse);
              transactionApiExpect(res).toMatchPaymentTransactionDocument(document);
            });

            test('inventory payment transaction', async ({ requestGetTransaction, saveAccount, saveTransaction, saveCategory, saveProject, saveRecipient, saveProduct }) => {
              const document = paymentTransactionDataFactory.document({
                account: accountDocument,
                category: inventoryCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                product: genericProductDocument,
              });

              await saveAccount(accountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProduct(genericProductDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(paymentResponse);
              transactionApiExpect(res).toMatchPaymentTransactionDocument(document);
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(paymentResponse);
              transactionApiExpect(res).toMatchPaymentTransactionDocument(document);
            });

            test('regular loan transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = loanTransactionDataFactory.document({
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(loanResponse);
              transactionApiExpect(res).toMatchLoanTransactionDocument(document);
            });

            test('inventory loan transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient, saveProducts }) => {
              const document = loanTransactionDataFactory.document({
                account: accountDocument,
                category: inventoryCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                product: specificProductDocument,
                loanAccount: loanAccountDocument,
              });

              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProducts(genericProductDocument, specificProductDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(loanResponse);
              transactionApiExpect(res).toMatchLoanTransactionDocument(document);
            });

            test('invoice loan transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = loanTransactionDataFactory.document({
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(loanResponse);
              transactionApiExpect(res).toMatchLoanTransactionDocument(document);
            });

            test('regular repayment transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = loanTransactionDataFactory.document({
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(loanResponse);
              transactionApiExpect(res).toMatchLoanTransactionDocument(document);
            });

            test('inventory repayment transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient, saveProducts }) => {
              const document = loanTransactionDataFactory.document({
                account: loanAccountDocument,
                category: inventoryCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                product: variantProductDocument,
                loanAccount: accountDocument,
              });

              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProducts(genericProductDocument, specificProductDocument, variantProductDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(loanResponse);
              transactionApiExpect(res).toMatchLoanTransactionDocument(document);
            });

            test('invoice repayment transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = loanTransactionDataFactory.document({
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(loanResponse);
              transactionApiExpect(res).toMatchLoanTransactionDocument(document);
            });

            test('paying split transaction', async ({ requestGetTransaction, saveAccounts, saveTransactions, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              const document = splitTransactionDataFactory.document({
                account: accountDocument,
                recipient: recipientDocument,
                splits: [
                  {
                    project: projectDocument,
                    category: childCategoryDocument,
                  },
                  {
                    category: regularCategoryDocument,
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
                    project: projectDocument,
                    loanAccount: loanAccountDocument,
                    category: childCategoryDocument,
                  },
                  {
                    category: regularCategoryDocument,
                    loanAccount: loanAccountDocument,
                  },
                  {
                    category: inventoryCategoryDocument,
                    product: genericProductDocument,
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
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument, childCategoryDocument);
              await saveProduct(genericProductDocument);
              await saveTransactions(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(splitResponse);
              transactionApiExpect(res).toMatchSplitTransactionDocument(document);
            });

            test('transfer transaction', async ({ requestGetTransaction, saveAccounts, saveTransactions, saveCategory, saveProject, saveRecipient }) => {
              const document = transferTransactionDataFactory.document({
                account: accountDocument,
                transferAccount: transferAccountDocument,
              });

              await saveAccounts(accountDocument, transferAccountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(regularCategoryDocument);
              await saveTransactions(document);
              const res = await requestGetTransaction(getAccountId(accountDocument), getTransactionId(document));
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(transferResponse);
              transactionApiExpect(res).toMatchTransferTransactionDocument(document, getAccountId(accountDocument));
            });

            test('loan transfer transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction }) => {
              const document = transferTransactionDataFactory.document({
                account: loanAccountDocument,
                transferAccount: transferAccountDocument,
              });

              await saveAccounts(loanAccountDocument, transferAccountDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document));
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(transferResponse);
              transactionApiExpect(res).toMatchTransferTransactionDocument(document, getAccountId(loanAccountDocument));
            });
          });

          test.describe('of a loan account', () => {
            test('loan transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = loanTransactionDataFactory.document({
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(loanResponse);
              transactionApiExpect(res).toMatchLoanTransactionDocument(document);
            });

            test('regular repayment transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = loanTransactionDataFactory.document({
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(loanResponse);
              transactionApiExpect(res).toMatchLoanTransactionDocument(document);
            });

            test('inventory repayment transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient, saveProduct }) => {
              const document = loanTransactionDataFactory.document({
                account: loanAccountDocument,
                category: inventoryCategoryDocument,
                project: projectDocument,
                recipient: recipientDocument,
                product: genericProductDocument,
                loanAccount: accountDocument,
              });

              await saveAccounts(accountDocument, loanAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProduct(genericProductDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document));
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(loanResponse);
              transactionApiExpect(res).toMatchLoanTransactionDocument(document);
            });

            test('invoice repayment transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              const document = loanTransactionDataFactory.document({
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(loanResponse);
              transactionApiExpect(res).toMatchLoanTransactionDocument(document);
            });

            test('loan split transaction', async ({ requestGetTransaction, saveAccounts, saveTransactions, saveProject, saveRecipient }) => {
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(splitResponse);
              transactionApiExpect(res).toMatchSplitTransactionDocument(document);
            });

            test('loan transfer transaction', async ({ requestGetTransaction, saveAccounts, saveTransaction }) => {
              const document = transferTransactionDataFactory.document({
                account: loanAccountDocument,
                transferAccount: transferAccountDocument,
              });

              await saveAccounts(loanAccountDocument, transferAccountDocument);
              await saveTransaction(document);
              const res = await requestGetTransaction(getAccountId(loanAccountDocument), getTransactionId(document));
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(transferResponse);
              transactionApiExpect(res).toMatchTransferTransactionDocument(document, getAccountId(loanAccountDocument));
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if transactionId', () => {
            test('is not mongo id', async ({ requestGetTransaction }) => {
              const res = await requestGetTransaction(accountDataFactory.id(), paymentTransactionDataFactory.id('not-valid'));
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('pathParameters', 'transactionId');
            });

            test('does not belong to any transaction', async ({ requestGetTransaction }) => {
              const res = await requestGetTransaction(accountDataFactory.id(), paymentTransactionDataFactory.id());
              transactionApiExpect(res).toBeNotFoundResponse();
            });
          });

          test.describe('if accountId', () => {
            test('is not mongo id', async ({ requestGetTransaction }) => {
              const res = await requestGetTransaction(accountDataFactory.id('not-valid'), paymentTransactionDataFactory.id());
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('pathParameters', 'accountId');
            });
          });
        });
      }
    });
  });
});
