import { getCategoryId, getTransactionId } from '@household/shared/common/utils';
import { entries } from '@household/shared/common/utils';
import { AccountType, CategoryType } from '@household/shared/enums';
import { allowUsers } from '@household/test/utils';
import { test as categoryApiTest, expect as categoryApiExpect } from '@household/test/fixtures/category-api.fixture';
import { expect as productApiExpect } from '@household/test/fixtures/product-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { mergeExpects, mergeTests } from '@playwright/test';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { test as accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { test as transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { test as categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { test as productDbTest } from '@household/test/fixtures/product-db.fixture';

const permissionMap = allowUsers('editor');

const expect = mergeExpects(categoryApiExpect, apiExpect, productApiExpect, transactionApiExpect);

const test = mergeTests(categoryApiTest, accountDbTest, transactionDbTest, categoryDbTest, productDbTest);

test.describe('POST category/v1/categories/{categoryId}/merge', () => {
  let sourceCategoryDocument: Documents.Category;
  let targetCategoryDocument: Documents.Category;

  test.beforeEach(async () => {
    sourceCategoryDocument = categoryDataFactory.document();
    targetCategoryDocument = categoryDataFactory.document({
      body: {
        categoryType: sourceCategoryDocument.categoryType,
      },
    });
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestMergeCategories }) => {
      const res = await requestMergeCategories(categoryDataFactory.id(), [categoryDataFactory.id()]);
      expect(res).toBeUnauthorizedResponse();
    });
  });

  for (const [
    userType,
    isAllowed,
  ] of entries(permissionMap)) {
    test.describe(`called as ${userType}`, () => {
      test.use({
        userType,
      });

      if (!isAllowed) {
        test('should return forbidden', async ({ requestMergeCategories }) => {
          const res = await requestMergeCategories(categoryDataFactory.id(), [categoryDataFactory.id()]);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should merge', () => {
          test('a category and reassign its child', async ({ requestMergeCategories, saveCategories, findCategoryById }) => {
            const childOfSourceCategoryDocument = categoryDataFactory.document({
              body: {
                categoryType: sourceCategoryDocument.categoryType,
              },
              parentCategory: sourceCategoryDocument,
            });

            await saveCategories(sourceCategoryDocument, targetCategoryDocument, childOfSourceCategoryDocument);

            const res = await requestMergeCategories(getCategoryId(targetCategoryDocument), [getCategoryId(sourceCategoryDocument)]);
            expect(res).toBeNoContentResponse();

            expect(await findCategoryById(getCategoryId(sourceCategoryDocument))).toHaveBeenDeletedFromDatabase();
            
            expect(childOfSourceCategoryDocument).toHaveItsParentReassigned(await findCategoryById(getCategoryId(childOfSourceCategoryDocument)), targetCategoryDocument);
          });
        });

        Object.values(CategoryType).forEach((categoryType) => {
          test.describe(`should reassign ${categoryType} category in related`, () => {
            let productDocument: Documents.Product;
            let accountDocument: Documents.Account;
            let loanAccountDocument: Documents.Account;

            test.beforeEach(() => {
              sourceCategoryDocument = categoryDataFactory.document({
                body: {
                  categoryType,
                },
              });
              targetCategoryDocument = categoryDataFactory.document({
                body: {
                  categoryType,
                },
              });
            
              accountDocument = accountDataFactory.document();
              loanAccountDocument = accountDataFactory.document({
                accountType: AccountType.Loan,
              });
            
              if (categoryType === CategoryType.Inventory) {
                productDocument = productDataFactory.document.generic();
              }
            });

            test('payment transaction', async ({ requestMergeCategories, saveAccounts, saveTransactions, findTransactionById, saveCategories, findCategoryById, saveProducts }) => {
              if (categoryType === CategoryType.Inventory) {
                await saveProducts(productDocument);
              }

              const paymentTransactionDocument = paymentTransactionDataFactory.document({
                account: accountDocument,
                category: sourceCategoryDocument,
                product: productDocument,
              });

              await saveCategories(sourceCategoryDocument, targetCategoryDocument);
              await saveAccounts(accountDocument);
              await saveTransactions(paymentTransactionDocument);

              const res = await requestMergeCategories(getCategoryId(targetCategoryDocument), [getCategoryId(sourceCategoryDocument)]);
              expect(res).toBeNoContentResponse();

              expect(await findCategoryById(getCategoryId(sourceCategoryDocument))).toHaveBeenDeletedFromDatabase();
              expect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(paymentTransactionDocument)), {
                category: {
                  from: sourceCategoryDocument,
                  to: targetCategoryDocument,
                },
              });
            });

            test('deferred transaction', async ({ requestMergeCategories, saveAccounts, saveTransactions, findTransactionById, saveCategories, findCategoryById, saveProducts }) => {
              if (categoryType === CategoryType.Inventory) {
                await saveProducts(productDocument);
              }

              const deferredTransactionDocument = deferredTransactionDataFactory.document({
                account: accountDocument,
                category: sourceCategoryDocument,
                loanAccount: loanAccountDocument,
                product: productDocument,
              });

              await saveCategories(sourceCategoryDocument, targetCategoryDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveTransactions(deferredTransactionDocument);

              const res = await requestMergeCategories(getCategoryId(targetCategoryDocument), [getCategoryId(sourceCategoryDocument)]);
              expect(res).toBeNoContentResponse();

              expect(await findCategoryById(getCategoryId(sourceCategoryDocument))).toHaveBeenDeletedFromDatabase();
              expect(deferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await findTransactionById(getTransactionId(deferredTransactionDocument)), {
                category: {
                  from: sourceCategoryDocument,
                  to: targetCategoryDocument,
                },
              });
            });

            test('reimbursement transaction', async ({ requestMergeCategories, saveAccounts, saveTransactions, findTransactionById, saveCategories, findCategoryById, saveProducts }) => {
              if (categoryType === CategoryType.Inventory) {
                await saveProducts(productDocument);
              }

              const reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: sourceCategoryDocument,
                loanAccount: accountDocument,
                product: productDocument,
              });

              await saveCategories(sourceCategoryDocument, targetCategoryDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveTransactions(reimbursementTransactionDocument);

              const res = await requestMergeCategories(getCategoryId(targetCategoryDocument), [getCategoryId(sourceCategoryDocument)]);
              expect(res).toBeNoContentResponse();

              expect(await findCategoryById(getCategoryId(sourceCategoryDocument))).toHaveBeenDeletedFromDatabase();
              expect(reimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await findTransactionById(getTransactionId(reimbursementTransactionDocument)), {
                category: {
                  from: sourceCategoryDocument,
                  to: targetCategoryDocument,
                },
              });
            });

            test('split transaction', async ({ requestMergeCategories, saveAccounts, saveTransactions, findTransactionById, saveCategories, findCategoryById, saveProducts }) => {
              if (categoryType === CategoryType.Inventory) {
                await saveProducts(productDocument);
              }

              const splitTransactionDocument = splitTransactionDataFactory.document({
                account: accountDocument,
                splits: [
                  {
                    category: sourceCategoryDocument,
                    product: productDocument,
                  },
                ],
                loans: [
                  {
                    category: sourceCategoryDocument,
                    product: productDocument,
                    loanAccount: loanAccountDocument,
                  },
                ],
              });

              await saveCategories(sourceCategoryDocument, targetCategoryDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveTransactions(splitTransactionDocument);

              const res = await requestMergeCategories(getCategoryId(targetCategoryDocument), [getCategoryId(sourceCategoryDocument)]);
              expect(res).toBeNoContentResponse();

              expect(await findCategoryById(getCategoryId(sourceCategoryDocument))).toHaveBeenDeletedFromDatabase();
              expect(splitTransactionDocument).toHaveRelatedDocumentsChangedInSplitTransaction(await findTransactionById(getTransactionId(splitTransactionDocument)), {
                category: {
                  from: sourceCategoryDocument,
                  to: targetCategoryDocument,
                },
              });
            });
          });
        });

        test.describe('should return error', () => {
          test('if a source category does not exist', async ({ requestMergeCategories, saveCategories }) => {
            await saveCategories(sourceCategoryDocument, targetCategoryDocument);

            const res = await requestMergeCategories(getCategoryId(targetCategoryDocument), [
              getCategoryId(sourceCategoryDocument),
              categoryDataFactory.id(),
            ]);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Some of the categories are not found');
          });

          test('if a source category type is different than the others', async ({ requestMergeCategories, saveCategories }) => {
            const otherTypeCategoryDocument = categoryDataFactory.document({
              body: {
                categoryType: sourceCategoryDocument.categoryType === CategoryType.Regular ? CategoryType.Inventory : CategoryType.Regular,
              },
            });

            await saveCategories(sourceCategoryDocument, targetCategoryDocument, otherTypeCategoryDocument);

            const res = await requestMergeCategories(getCategoryId(targetCategoryDocument), [
              getCategoryId(sourceCategoryDocument),
              getCategoryId(otherTypeCategoryDocument),
            ]);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('All categories must be of same type');
          });

          test('if a source category is an ancestor of the target category', async ({ requestMergeCategories, saveCategories }) => {
            targetCategoryDocument = categoryDataFactory.document({
              body: {
                categoryType: sourceCategoryDocument.categoryType,
              },
              parentCategory: sourceCategoryDocument,
            });

            await saveCategories(sourceCategoryDocument, targetCategoryDocument);

            const res = await requestMergeCategories(getCategoryId(targetCategoryDocument), [getCategoryId(sourceCategoryDocument)]);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('A source category is among the target category ancestors');
          });

          test.describe('if body', () => {
            test('is not array', async ({ requestMergeCategories }) => {
              const res = await requestMergeCategories(categoryDataFactory.id(), {} as any);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'data', 'array');
            });

            test('has too few items', async ({ requestMergeCategories }) => {
              const res = await requestMergeCategories(categoryDataFactory.id(), []);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooFewItemsValidationError('body', 'data', 1);
            });
          });

          test.describe('if body[0]', () => {
            test('is not string', async ({ requestMergeCategories }) => {
              const res = await requestMergeCategories(categoryDataFactory.id(), [1] as any);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'data/0', 'string');
            });

            test('is not a valid mongo id', async ({ requestMergeCategories }) => {
              const res = await requestMergeCategories(categoryDataFactory.id(), [categoryDataFactory.id('not-valid')]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'data/0');
            });
          });

          test.describe('is categoryId', () => {
            test('is not a valid mongo id', async ({ requestMergeCategories }) => {
              const res = await requestMergeCategories('not-valid' as Api.Category.Id, [categoryDataFactory.id()]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'categoryId');
            });

            test('does not belong to any category', async ({ requestMergeCategories }) => {
              const res = await requestMergeCategories(categoryDataFactory.id(), [getCategoryId(sourceCategoryDocument)]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the categories are not found');
            });
          });
        });
      }
    });
  }
});
