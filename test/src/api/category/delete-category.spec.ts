import { getCategoryId, getTransactionId } from '@household/shared/common/utils';
import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { test as categoryApiTest, expect as categoryApiExpect } from '@household/test/fixtures/category-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as productApiExpect } from '@household/test/fixtures/product-api.fixture';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { mergeExpects, mergeTests } from '@playwright/test';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { AccountType, CategoryType } from '@household/shared/enums';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { test as accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { test as transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { test as categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { test as productDbTest } from '@household/test/fixtures/product-db.fixture';

const permissionMap = allowUsers('editor');

const expect = mergeExpects(categoryApiExpect, apiExpect, transactionApiExpect, productApiExpect);

const test = mergeTests(categoryApiTest, accountDbTest, transactionDbTest, categoryDbTest, productDbTest);

test.describe('DELETE /category/v1/categories/{categoryId}', () => {
  let categoryDocument: Documents.Category;

  test.beforeEach(async () => {
    categoryDocument = categoryDataFactory.document();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestDeleteCategory }) => {
      const res = await requestDeleteCategory(categoryDataFactory.id());
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
        test('should return forbidden', async ({ requestDeleteCategory }) => {
          const res = await requestDeleteCategory(categoryDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete category', async ({ requestDeleteCategory, saveCategory, findCategoryById }) => {
          await saveCategory(categoryDocument);

          const res = await requestDeleteCategory(getCategoryId(categoryDocument));
          expect(res).toBeNoContentResponse();

          expect(await findCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('children should be reassigned', () => {
          let childCategory: Documents.Category;
          let grandChildCategory: Documents.Category;

          test.beforeEach(async () => {
            childCategory = categoryDataFactory.document({
              parentCategory: categoryDocument,
            });

            grandChildCategory = categoryDataFactory.document({
              parentCategory: childCategory,
            });
          });

          test('to root if did not have parent', async ({ requestDeleteCategory, saveCategories, findCategoryById }) => {
            await saveCategories(categoryDocument, childCategory, grandChildCategory);

            const res = await requestDeleteCategory(getCategoryId(categoryDocument));
            expect(res).toBeNoContentResponse();

            expect(await findCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
            expect(childCategory).toHaveItsParentReassigned(await findCategoryById(getCategoryId(childCategory)));
            expect(grandChildCategory).toHaveItsParentReassigned(await findCategoryById(getCategoryId(grandChildCategory)), await findCategoryById(getCategoryId(childCategory)));
          });

          test('to parent if had parent', async ({ requestDeleteCategory, saveCategories, findCategoryById }) => {
            await saveCategories(categoryDocument, childCategory, grandChildCategory);

            const res = await requestDeleteCategory(getCategoryId(childCategory));
            expect(res).toBeNoContentResponse();

            expect(await findCategoryById(getCategoryId(childCategory))).toHaveBeenDeletedFromDatabase();
            expect(grandChildCategory).toHaveItsParentReassigned(await findCategoryById(getCategoryId(grandChildCategory)), categoryDocument);
          });
        });

        Object.values(CategoryType).forEach((categoryType) => {
          test.describe(`should unset ${categoryType} category in related`, () => {
            let productDocument: Documents.Product;
            let accountDocument: Documents.Account;
            let loanAccountDocument: Documents.Account;

            test.beforeEach(() => {
              categoryDocument = categoryDataFactory.document({
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

            test('payment transaction', async ({ requestDeleteCategory, saveAccounts, saveTransactions, findTransactionById, saveCategories, findCategoryById, saveProducts }) => {

              if (categoryType === CategoryType.Inventory) {
                await saveProducts(productDocument);
              }

              const paymentTransactionDocument = paymentTransactionDataFactory.document({
                account: accountDocument,
                category: categoryDocument,
                product: productDocument,
              });

              await saveCategories(categoryDocument);
              await saveAccounts(accountDocument);
              await saveTransactions(paymentTransactionDocument);

              const res = await requestDeleteCategory(getCategoryId(categoryDocument));
              expect(res).toBeNoContentResponse();

              expect(await findCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
              expect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(paymentTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
            });

            test('deferred transaction', async ({ requestDeleteCategory, saveAccounts, saveTransactions, findTransactionById, saveCategories, findCategoryById, saveProducts }) => {

              if (categoryType === CategoryType.Inventory) {
                await saveProducts(productDocument);
              }

              const deferredTransactionDocument = deferredTransactionDataFactory.document({
                account: accountDocument,
                category: categoryDocument,
                loanAccount: loanAccountDocument,
                product: productDocument,
              });

              await saveCategories(categoryDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveTransactions(deferredTransactionDocument);

              const res = await requestDeleteCategory(getCategoryId(categoryDocument));
              expect(res).toBeNoContentResponse();

              expect(await findCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
              expect(deferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await findTransactionById(getTransactionId(deferredTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
            });

            test('reimbursement transaction', async ({ requestDeleteCategory, saveAccounts, saveTransactions, findTransactionById, saveCategories, findCategoryById, saveProducts }) => {

              if (categoryType === CategoryType.Inventory) {
                await saveProducts(productDocument);
              }

              const reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: categoryDocument,
                loanAccount: accountDocument,
                product: productDocument,
              });

              await saveCategories(categoryDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveTransactions(reimbursementTransactionDocument);

              const res = await requestDeleteCategory(getCategoryId(categoryDocument));
              expect(res).toBeNoContentResponse();

              expect(await findCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
              expect(reimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await findTransactionById(getTransactionId(reimbursementTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
            });

            test('split transaction', async ({ requestDeleteCategory, saveAccounts, saveTransactions, findTransactionById, saveCategories, findCategoryById, saveProducts }) => {

              if (categoryType === CategoryType.Inventory) {
                await saveProducts(productDocument);
              }

              const splitTransactionDocument = splitTransactionDataFactory.document({
                account: accountDocument,
                splits: [
                  {
                    category: categoryDocument,
                    product: productDocument,
                  },
                ],
                loans: [
                  {
                    category: categoryDocument,
                    product: productDocument,
                    loanAccount: loanAccountDocument,
                  },
                ],
              });

              await saveCategories(categoryDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveTransactions(splitTransactionDocument);

              const res = await requestDeleteCategory(getCategoryId(categoryDocument));
              expect(res).toBeNoContentResponse();

              expect(await findCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
              expect(splitTransactionDocument).toHaveRelatedDocumentsChangedInSplitTransaction(await findTransactionById(getTransactionId(splitTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if categoryId', () => {
            test('is not mongo id', async ({ requestDeleteCategory }) => {
              const res = await requestDeleteCategory('not-valid' as Api.Category.Id);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'categoryId');
            });
          });
        });
      }
    });
  }
});
