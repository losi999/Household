import { entries, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { CategoryType, AccountType } from '@household/shared/enums';
import { Documents } from '@household/shared/types/documents';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { allowUsers } from '@household/test/utils';

import { test as transactionApiTest, expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { test as transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { test as categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { test as projectDbTest } from '@household/test/fixtures/project-db.fixture';
import { test as recipientDbTest } from '@household/test/fixtures/recipient-db.fixture';
import { test as productDbTest } from '@household/test/fixtures/product-db.fixture';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';

const expect = mergeExpects(transactionApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

const test = mergeTests(transactionApiTest, accountDbTest, transactionDbTest, categoryDbTest, projectDbTest, recipientDbTest, productDbTest);

test.describe('PUT transaction/v1/transactions/{transactionId}/split (split)', () => {
  let request: Requests.SplitTransaction;
  let originalDocument: Documents.PaymentTransaction;

  let projectDocument: Documents.Project;
  let recipientDocument: Documents.Recipient;
  let accountDocument: Documents.Account;
  let secondaryAccountDocument: Documents.Account;
  let regularCategoryDocument: Documents.Category;
  let invoiceCategoryDocument: Documents.Category;
  let inventoryCategoryDocument: Documents.Category;
  let productDocument: Documents.Product;

  test.beforeEach(async () => {
    projectDocument = projectDataFactory.document();
    recipientDocument = recipientDataFactory.document();
    accountDocument = accountDataFactory.document();
    secondaryAccountDocument = accountDataFactory.document();

    regularCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Regular,
      },
    });

    invoiceCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Invoice,
      },
    });

    inventoryCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });

    productDocument = productDataFactory.document({
      category: inventoryCategoryDocument,
    });

    originalDocument = paymentTransactionDataFactory.document({
      account: accountDocument,
    });

    request = splitTransactionDataFactory.request({
      accountId: getAccountId(accountDocument),
      recipientId: getRecipientId(recipientDocument),
      splits: [
        {
          projectId: getProjectId(projectDocument),
          productId: getProductId(productDocument),
          categoryId: getCategoryId(regularCategoryDocument),
        },
        {
          projectId: getProjectId(projectDocument),
          productId: getProductId(productDocument),
          categoryId: getCategoryId(inventoryCategoryDocument),
        },
        {
          projectId: getProjectId(projectDocument),
          productId: getProductId(productDocument),
          categoryId: getCategoryId(invoiceCategoryDocument),
        },
      ],
      loans: [
        {
          projectId: getProjectId(projectDocument),
          productId: getProductId(productDocument),
          categoryId: getCategoryId(regularCategoryDocument),
          loanAccountId: getAccountId(secondaryAccountDocument),
        },
        {
          projectId: getProjectId(projectDocument),
          productId: getProductId(productDocument),
          categoryId: getCategoryId(inventoryCategoryDocument),
          loanAccountId: getAccountId(secondaryAccountDocument),
        },
        {
          projectId: getProjectId(projectDocument),
          productId: getProductId(productDocument),
          categoryId: getCategoryId(invoiceCategoryDocument),
          loanAccountId: getAccountId(secondaryAccountDocument),
        },
      ],
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdateToSplitTransaction }) => {
      const res = await requestUpdateToSplitTransaction(splitTransactionDataFactory.id(), request);
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
        test('should return forbidden', async ({ requestUpdateToSplitTransaction }) => {
          const res = await requestUpdateToSplitTransaction(splitTransactionDataFactory.id(), request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should update transaction', () => {
          test('with complete body', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
            await saveTransaction(originalDocument);
            await saveAccounts(accountDocument, secondaryAccountDocument);
            await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
            await saveProject(projectDocument);
            await saveRecipient(recipientDocument);
            await saveProduct(productDocument);
            const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
            expect(res).toBeNoContentResponse();
            const transactionId = getTransactionId(originalDocument);
            expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
          });

          test('keeping existing deferred split', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransactions, getTransactionById }) => {
            const splitDocument = splitTransactionDataFactory.document({
              account: accountDocument,
              loans: [
                {
                  loanAccount: secondaryAccountDocument,
                },
              ],
            });

            request = splitTransactionDataFactory.request({
              accountId: getAccountId(accountDocument),
              recipientId: undefined,
              splits: undefined,
              loans: [
                {
                  loanAccountId: getAccountId(secondaryAccountDocument),
                  transactionId: getTransactionId(splitDocument.deferredSplits[0]),
                  categoryId: undefined,
                  projectId: undefined,
                  productId: undefined,
                  quantity: undefined,
                },
              ],
            });

            await saveTransactions(splitDocument);
            await saveAccounts(accountDocument, secondaryAccountDocument);
            const res = await requestUpdateToSplitTransaction(getTransactionId(splitDocument), request);
            expect(res).toBeNoContentResponse();
            const transactionId = getTransactionId(originalDocument);
            expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
          });

          test.describe('without optional properties', () => {
            test('description', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                description: undefined,
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('recipientId', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                recipientId: undefined,
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('splits', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                splits: undefined,
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('loans', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                loans: undefined,
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('splits.description', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                splits: [
                  {
                    ...request.splits[0],
                    description: undefined,
                  },
                ],
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('splits.inventory', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                splits: [
                  {
                    ...request.splits[0],
                    categoryId: getCategoryId(inventoryCategoryDocument),
                    productId: undefined,
                    quantity: undefined,
                  },
                ],
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('splits.invoice', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                splits: [
                  {
                    ...request.splits[0],
                    categoryId: getCategoryId(invoiceCategoryDocument),
                    invoiceNumber: undefined,
                    billingEndDate: undefined,
                    billingStartDate: undefined,
                  },
                ],
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('splits.invoice.invoiceNumber', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                splits: [
                  {
                    ...request.splits[0],
                    categoryId: getCategoryId(invoiceCategoryDocument),
                    invoiceNumber: undefined,
                  },
                ],
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('splits.categoryId', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                splits: [
                  {
                    ...request.splits[0],
                    categoryId: undefined,
                  },
                ],
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('splits.projectId', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                splits: [
                  {
                    ...request.splits[0],
                    projectId: undefined,
                  },
                ],
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('loans.description', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                loans: [
                  {
                    ...request.loans[0],
                    description: undefined,
                  },
                ],
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('loans.inventory', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                loans: [
                  {
                    ...request.loans[0],
                    categoryId: getCategoryId(inventoryCategoryDocument),
                    productId: undefined,
                    quantity: undefined,
                  },
                ],
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('loans.invoice', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                loans: [
                  {
                    ...request.loans[0],
                    categoryId: getCategoryId(invoiceCategoryDocument),
                    invoiceNumber: undefined,
                    billingEndDate: undefined,
                    billingStartDate: undefined,
                  },
                ],
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('loans.invoice.invoiceNumber', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                loans: [
                  {
                    ...request.loans[0],
                    categoryId: getCategoryId(invoiceCategoryDocument),
                    invoiceNumber: undefined,
                  },
                ],
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('loans.categoryId', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                loans: [
                  {
                    ...request.loans[0],
                    categoryId: undefined,
                  },
                ],
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('loans.projectId', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                loans: [
                  {
                    ...request.loans[0],
                    projectId: undefined,
                  },
                ],
              });
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });
          });

          test.describe('with unsetting', () => {
            let splitDocument: Documents.SplitTransaction;

            test.beforeEach(async () => {
              splitDocument = splitTransactionDataFactory.document({
                account: accountDocument,
                recipient: recipientDocument,
                body: {
                  description: 'old description',
                },
                loans: [
                  {
                    loanAccount: secondaryAccountDocument,
                  },
                ],
              });
            });

            test('description', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                description: undefined,
              });
              await saveTransaction(splitDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(splitDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('recipientId', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                recipientId: undefined,
              });
              await saveTransaction(splitDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(splitDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('splits', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                splits: undefined,
              });
              await saveTransaction(splitDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(splitDocument), request);
              expect(res).toBeNoContentResponse();
              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });

            test('loans', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransactions, getTransactionById, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              request = splitTransactionDataFactory.request({
                ...request,
                loans: undefined,
              });
              const transferAccountDocument = accountDataFactory.document();

              const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
                account: accountDocument,
                transferAccount: transferAccountDocument,
              });

              await saveTransactions(splitDocument, repayingTransferTransactionDocument);
              await saveAccounts(accountDocument, transferAccountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(splitDocument), request);
              expect(res).toBeNoContentResponse();

              const transactionId = getTransactionId(originalDocument);
              expect(request).toHaveBeenSavedAsSplitTransactionDocument(await getTransactionById(transactionId));
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if transactionId', () => {
            test('is not mongo id', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(splitTransactionDataFactory.id('not-valid'), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'transactionId');
            });

            test('does not belong to any transaction', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(splitTransactionDataFactory.id(), request);
              expect(res).toBeNotFoundResponse();
            });
          });

          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                extra: 123, 
              } as any));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extra');
            });

            test('misses both splits and loans', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                ...request,
                splits: undefined,
                loans: undefined,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'splits');
              expect(res).toHaveRequiredPropertyValidationError('body', 'loans');
            });
          });

          test.describe('if description', () => {
            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                description: <any> 1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                description: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if issuedAt', () => {
            test('is missing', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                issuedAt: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'issuedAt');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                issuedAt: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'issuedAt', 'string');
            });

            test('is not date-time format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                issuedAt: 'not-date-time', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'issuedAt', 'date-time');
            });
          });

          test.describe('if accountId', () => {
            test('belongs to a loan type account', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, saveCategories, saveProject, saveRecipient, saveProduct }) => {
              const loanAccountDocument = accountDataFactory.document({
                accountType: AccountType.Loan,
              });
              await saveTransaction(originalDocument);
              await saveAccounts(loanAccountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                ...request,
                accountId: getAccountId(loanAccountDocument),  
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Account type cannot be loan');
            });

            test('does not belong to any account', async ({ requestUpdateToSplitTransaction, saveTransaction, saveCategories, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                ...request,
                accountId: accountDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the accounts are not found');
            });

            test('is missing', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                accountId: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'accountId');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                accountId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'accountId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                accountId: accountDataFactory.id('not-mongo-id'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'accountId');
            });
          });

          test.describe('if recipientId', () => {
            test('does not belong to any recipient', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, saveCategories, saveProject, saveProduct }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveProduct(productDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                ...request,
                recipientId: recipientDataFactory.id(), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No recipient found');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                recipientId: <any>1, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'recipientId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                recipientId: recipientDataFactory.id('not-mongo-id'), 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'recipientId');
            });
          });

          test.describe('if splits', () => {
            test('is not an array', async ({ requestUpdateToSplitTransaction }) => {
              request.splits = {} as any;
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'splits', 'array');
            });

            test('is empty array', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooFewItemsValidationError('body', 'splits', 1);
            });
          });

          test.describe('if splits[0]', () => {
            test('is not object', async ({ requestUpdateToSplitTransaction }) => {
              request.splits = [1] as any;
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'splits/0', 'object');
            });

            test('has additional properties', async ({ requestUpdateToSplitTransaction }) => {
              request.splits = [
                {
                  extra: 1,
                },
              ] as any;
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'splits/0', 'extra');
            });
          });

          test.describe('if splits.amount', () => {
            test('is missing', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    amount: undefined, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not number', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    amount: <any>'1', 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
            });
          });

          test.describe('if splits.description', () => {
            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    description: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    description: '', 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if splits.quantity', () => {
            test('is present and productId is missing', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    quantity: 1, 
                    productId: undefined,
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'quantity', 'productId');
            });

            test('is not number', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    quantity: <any>'1', 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'quantity', 'number');
            });

            test('is too small', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    quantity: 0, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'quantity', 0);
            });
          });

          test.describe('if splits.productId', () => {
            test('is present and quantity is missing', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    productId: productDataFactory.id(),
                    quantity: undefined, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'productId', 'quantity');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    productId: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'productId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    productId: productDataFactory.id('not-mongo-id'), 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'productId');
            });

            test('does not belong to any product', async ({ requestUpdateToSplitTransaction, saveAccount, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccount(accountDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                ...request,
                splits: [
                  {
                    ...request.splits[0],
                    categoryId: getCategoryId(inventoryCategoryDocument),
                    productId: productDataFactory.id(), 
                  },
                ],
                loans: undefined,        
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No product found');
            });
          });

          test.describe('if splits.invoiceNumber', () => {
            test('is present and billingEndDate, billingStartDate are missing', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    billingEndDate: undefined,
                    billingStartDate: undefined, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'invoiceNumber', 'billingEndDate', 'billingStartDate');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    invoiceNumber: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'invoiceNumber', 'string');
            });

            test('is too short', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    invoiceNumber: '', 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'invoiceNumber', 1);
            });
          });

          test.describe('if splits.billingEndDate', () => {
            test('is present and billingStartDate is missing', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    billingStartDate: undefined, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'billingEndDate', 'billingStartDate');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    billingEndDate: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'billingEndDate', 'string');
            });

            test('is not date format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    billingEndDate: 'not-date', 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'billingEndDate', 'date');
            });

            test('is later than billingStartDate', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    billingEndDate: '2022-06-01',
                    billingStartDate: '2022-06-03', 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooEarlyDateValidationError('body', 'billingEndDate', true);
            });
          });

          test.describe('if splits.billingStartDate', () => {
            test('is present and billingEndDate is missing', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    billingEndDate: undefined, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'billingStartDate', 'billingEndDate');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    billingStartDate: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'billingStartDate', 'string');
            });

            test('is not date format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    billingStartDate: 'not-date', 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'billingStartDate', 'date');
            });
          });

          test.describe('if splits.categoryId', () => {
            test('does not belong to any category', async ({ requestUpdateToSplitTransaction, saveAccount, saveTransaction, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccount(accountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                ...request,
                splits: [
                  {
                    ...request.splits[0],
                    categoryId: categoryDataFactory.id(), 
                  },
                ],
                loans: undefined,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the categories are not found');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    categoryId: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'categoryId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    categoryId: categoryDataFactory.id('not-mongo-id'), 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'categoryId');
            });
          });

          test.describe('if splits.projectId', () => {
            test('does not belong to any project', async ({ requestUpdateToSplitTransaction, saveAccount, saveTransaction, saveCategories, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccount(accountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                ...request,
                splits: [
                  {
                    ...request.splits[0],
                    projectId: projectDataFactory.id(), 
                  },
                ],
                loans: undefined,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the projects are not found');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    projectId: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'projectId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                splits: [
                  {
                    projectId: projectDataFactory.id('not-mongo-id'), 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'projectId');
            });
          });

          test.describe('if loans', () => {
            test('is not an array', async ({ requestUpdateToSplitTransaction }) => {
              request.loans = {} as any;
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'loans', 'array');
            });

            test('is empty array', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooFewItemsValidationError('body', 'loans', 1);
            });
          });

          test.describe('if loans[0]', () => {
            test('is not object', async ({ requestUpdateToSplitTransaction }) => {
              request.loans = [1] as any;
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'loans/0', 'object');
            });

            test('has additional properties', async ({ requestUpdateToSplitTransaction }) => {
              request.loans = [
                {
                  extra: 1,
                },
              ] as any;
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), request);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'loans/0', 'extra');
            });
          });

          test.describe('if loans.amount', () => {
            test('is missing', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    amount: undefined,
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'amount');
            });

            test('is not number', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    amount: <any>'1', 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
            });
          });

          test.describe('if loans.description', () => {
            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    description: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'description', 'string');
            });

            test('is too short', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    description: '', 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'description', 1);
            });
          });

          test.describe('if loans.quantity', () => {
            test('is present and productId is missing', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    quantity: 1, 
                    productId: undefined,
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'quantity', 'productId');
            });

            test('is not number', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    quantity: <any>'1', 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'quantity', 'number');
            });

            test('is too small', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    quantity: 0, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveExclusiveTooSmallValidationError('body', 'quantity', 0);
            });
          });

          test.describe('if loans.productId', () => {
            test('is present and quantity is missing', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    productId: productDataFactory.id(),
                    quantity: undefined, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'productId', 'quantity');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    productId: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'productId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    productId: productDataFactory.id('not-mongo-id'), 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'productId');
            });

            test('does not belong to any product', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, saveCategory, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategory(inventoryCategoryDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                ...request,
                loans: [
                  {
                    ...request.loans[0],
                    loanAccountId: getAccountId(secondaryAccountDocument),
                    categoryId: getCategoryId(inventoryCategoryDocument),
                    productId: productDataFactory.id(), 
                  },
                ],
                splits: undefined,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('No product found');
            });
          });

          test.describe('if loans.invoiceNumber', () => {
            test('is present and billingEndDate, billingStartDate are missing', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    billingEndDate: undefined,
                    billingStartDate: undefined, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'invoiceNumber', 'billingEndDate', 'billingStartDate');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    invoiceNumber: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'invoiceNumber', 'string');
            });

            test('is too short', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    invoiceNumber: '', 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'invoiceNumber', 1);
            });
          });

          test.describe('if loans.billingEndDate', () => {
            test('is present and billingStartDate is missing', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    billingStartDate: undefined, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'billingEndDate', 'billingStartDate');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    billingEndDate: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'billingEndDate', 'string');
            });

            test('is not date format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    billingEndDate: 'not-date', 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'billingEndDate', 'date');
            });

            test('is later than billingStartDate', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    billingEndDate: '2022-06-01',
                    billingStartDate: '2022-06-03', 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooEarlyDateValidationError('body', 'billingEndDate', true);
            });
          });

          test.describe('if loans.billingStartDate', () => {
            test('is present and billingEndDate is missing', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    billingEndDate: undefined, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveDependentRequiredPropertyValidationError('body', 'billingStartDate', 'billingEndDate');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    billingStartDate: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'billingStartDate', 'string');
            });

            test('is not date format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    billingStartDate: 'not-date', 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'billingStartDate', 'date');
            });
          });

          test.describe('if loans.categoryId', () => {
            test('does not belong to any category', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, saveProject, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveProject(projectDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                ...request,
                loans: [
                  {
                    ...request.loans[0],
                    categoryId: categoryDataFactory.id(),
                  },
                ],
                splits: undefined,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the categories are not found');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    categoryId: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'categoryId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    categoryId: categoryDataFactory.id('not-mongo-id'), 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'categoryId');
            });
          });

          test.describe('if loans.projectId', () => {
            test('does not belong to any project', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, saveCategories, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument, secondaryAccountDocument);
              await saveCategories(regularCategoryDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                ...request,
                loans: [
                  {
                    ...request.loans[0],
                    projectId: projectDataFactory.id(), 
                  },
                ],
                splits: undefined,
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the projects are not found');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                ...request,
                loans: [
                  {
                    projectId: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'projectId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                ...request,
                loans: [
                  {
                    projectId: projectDataFactory.id('not-mongo-id'), 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'projectId');
            });
          });

          test.describe('if loans.loanAccountId', () => {
            test('does not belong to any account', async ({ requestUpdateToSplitTransaction, saveAccounts, saveTransaction, saveCategories, saveRecipient }) => {
              await saveTransaction(originalDocument);
              await saveAccounts(accountDocument);
              await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument);
              await saveRecipient(recipientDocument);
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                ...request,
                loans: [
                  {
                    loanAccountId: accountDataFactory.id(),
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the accounts are not found');
            });

            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    loanAccountId: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'loanAccountId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    loanAccountId: accountDataFactory.id('not-mongo-id'), 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'loanAccountId');
            });
          });

          test.describe('if loans.transactionId', () => {
            test('is not string', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    transactionId: <any>1, 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'transactionId', 'string');
            });

            test('is not mongo id format', async ({ requestUpdateToSplitTransaction }) => {
              const res = await requestUpdateToSplitTransaction(getTransactionId(originalDocument), splitTransactionDataFactory.request({
                loans: [
                  {
                    transactionId: deferredTransactionDataFactory.id('not-mongo-id'), 
                  },
                ],
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'transactionId');
            });
          });
        });
      }
    });
  });
});
