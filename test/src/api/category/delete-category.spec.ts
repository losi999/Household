import { getCategoryId, getTransactionId } from '@household/shared/common/utils';
import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { categoryApiTest, categoryApiExpect } from '@household/test/fixtures/category-api.fixture';
import { transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { mergeTests } from '@playwright/test';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { AccountType, CategoryType } from '@household/shared/enums';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { loanTransactionDataFactory } from '@household/test/api/transaction/loan/loan-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { productDbTest } from '@household/test/fixtures/product-db.fixture';

const permissionMap = allowUsers('editor');

const test = mergeTests(categoryApiTest, accountDbTest, transactionDbTest, categoryDbTest, productDbTest);

test.describe('DELETE /category/v1/categories/{categoryId}', () => {
  let categoryDocument: Documents.Category;

  test.beforeEach(async () => {
    categoryDocument = categoryDataFactory.document();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestDeleteCategory }) => {
      const res = await requestDeleteCategory(categoryDataFactory.id());
      categoryApiExpect(res).toBeUnauthorizedResponse();
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
          categoryApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete category', async ({ requestDeleteCategory, saveCategory, findCategoryById }) => {
          await saveCategory(categoryDocument);

          const res = await requestDeleteCategory(getCategoryId(categoryDocument));
          categoryApiExpect(res).toBeNoContentResponse();

          categoryApiExpect(await findCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
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
            categoryApiExpect(res).toBeNoContentResponse();

            categoryApiExpect(await findCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
            categoryApiExpect(childCategory).toHaveItsParentReassigned(await findCategoryById(getCategoryId(childCategory)));
            categoryApiExpect(grandChildCategory).toHaveItsParentReassigned(await findCategoryById(getCategoryId(grandChildCategory)), await findCategoryById(getCategoryId(childCategory)));
          });

          test('to parent if had parent', async ({ requestDeleteCategory, saveCategories, findCategoryById }) => {
            await saveCategories(categoryDocument, childCategory, grandChildCategory);

            const res = await requestDeleteCategory(getCategoryId(childCategory));
            categoryApiExpect(res).toBeNoContentResponse();

            categoryApiExpect(await findCategoryById(getCategoryId(childCategory))).toHaveBeenDeletedFromDatabase();
            categoryApiExpect(grandChildCategory).toHaveItsParentReassigned(await findCategoryById(getCategoryId(grandChildCategory)), categoryDocument);
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
              categoryApiExpect(res).toBeNoContentResponse();

              categoryApiExpect(await findCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
              transactionApiExpect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(paymentTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
            });

            test('loan transaction', async ({ requestDeleteCategory, saveAccounts, saveTransactions, findTransactionById, saveCategories, findCategoryById, saveProducts }) => {

              if (categoryType === CategoryType.Inventory) {
                await saveProducts(productDocument);
              }

              const loanTransactionDocument = loanTransactionDataFactory.document({
                account: accountDocument,
                category: categoryDocument,
                loanAccount: loanAccountDocument,
                product: productDocument,
              });

              await saveCategories(categoryDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveTransactions(loanTransactionDocument);

              const res = await requestDeleteCategory(getCategoryId(categoryDocument));
              categoryApiExpect(res).toBeNoContentResponse();

              categoryApiExpect(await findCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
              transactionApiExpect(loanTransactionDocument).toHaveRelatedDocumentsChangedInLoanTransaction(await findTransactionById(getTransactionId(loanTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
            });

            test('repayment transaction', async ({ requestDeleteCategory, saveAccounts, saveTransactions, findTransactionById, saveCategories, findCategoryById, saveProducts }) => {

              if (categoryType === CategoryType.Inventory) {
                await saveProducts(productDocument);
              }

              const repaymentTransactionDocument = loanTransactionDataFactory.document({
                account: loanAccountDocument,
                category: categoryDocument,
                loanAccount: accountDocument,
                product: productDocument,
              });

              await saveCategories(categoryDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveTransactions(repaymentTransactionDocument);

              const res = await requestDeleteCategory(getCategoryId(categoryDocument));
              categoryApiExpect(res).toBeNoContentResponse();

              categoryApiExpect(await findCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
              transactionApiExpect(repaymentTransactionDocument).toHaveRelatedDocumentsChangedInLoanTransaction(await findTransactionById(getTransactionId(repaymentTransactionDocument)), {
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
              categoryApiExpect(res).toBeNoContentResponse();

              categoryApiExpect(await findCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
              transactionApiExpect(splitTransactionDocument).toHaveRelatedDocumentsChangedInSplitTransaction(await findTransactionById(getTransactionId(splitTransactionDocument)), {
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
              categoryApiExpect(res).toBeBadRequestResponse();
              categoryApiExpect(res).toHavePatternValidationError('pathParameters', 'categoryId');
            });
          });
        });
      }
    });
  }
});
