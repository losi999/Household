import { getCategoryId, getProductId, getTransactionId } from '@household/shared/common/utils';
import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { test as categoryApiTest, expect as categoryApiExpect } from '@household/test/fixtures/category-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as productApiExpect } from '@household/test/fixtures/product-api.fixture';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { Category, Product } from '@household/shared/types/types';
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
  let categoryDocument: Category.Document;

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
          let childCategory: Category.Document;
          let grandChildCategory: Category.Document;

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

        test.describe('in related transactions', () => {
          Object.values(CategoryType).forEach((categoryType) => {
            test(`should category be unset if ${categoryType} category is deleted`, async ({ requestDeleteCategory, saveAccounts, saveTransactions, findTransactionById, saveCategories, findCategoryById, saveProducts }) => {
              categoryDocument = categoryDataFactory.document({
                body: {
                  categoryType: CategoryType.Inventory,
                },
              });

              const unrelatedCategoryDocument = categoryDataFactory.document({
                body: {
                  categoryType,
                },
              });

              let productDocument: Product.Document;
              let unrelatedProductDocument: Product.Document;

              if (categoryType === CategoryType.Inventory) {
                productDocument = productDataFactory.document({
                  category: categoryDocument,
                });

                unrelatedProductDocument = productDataFactory.document({
                  category: unrelatedCategoryDocument,
                });

                await saveProducts(productDocument, unrelatedProductDocument);
              }

              const accountDocument = accountDataFactory.document();
              const loanAccountDocument = accountDataFactory.document({
                accountType: AccountType.Loan,
              });

              const unrelatedPaymentTransactionDocument = paymentTransactionDataFactory.document({
                account: accountDocument,
                category: unrelatedCategoryDocument,
                product: unrelatedProductDocument,
              });

              const unrelatedDeferredTransactionDocument = deferredTransactionDataFactory.document({
                account: accountDocument,
                category: unrelatedCategoryDocument,
                product: unrelatedProductDocument,
                loanAccount: loanAccountDocument,
              });

              const unrelatedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: unrelatedCategoryDocument,
                product: unrelatedProductDocument,
                loanAccount: accountDocument,
              });

              const paymentTransactionDocument = paymentTransactionDataFactory.document({
                account: accountDocument,
                category: categoryDocument,
                product: productDocument,
              });

              const deferredTransactionDocument = deferredTransactionDataFactory.document({
                account: accountDocument,
                category: categoryDocument,
                loanAccount: loanAccountDocument,
                product: productDocument,
              });

              const reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: categoryDocument,
                loanAccount: accountDocument,
                product: productDocument,
              });

              const splitTransactionDocument = splitTransactionDataFactory.document({
                account: accountDocument,
                splits: [
                  {
                    category: categoryDocument,
                    product: productDocument,
                  },
                  {
                    category: unrelatedCategoryDocument,
                    product: unrelatedProductDocument,
                  },
                ],
                loans: [
                  {
                    category: categoryDocument,
                    product: productDocument,
                    loanAccount: loanAccountDocument,
                  },
                  {
                    category: unrelatedCategoryDocument,
                    product: unrelatedProductDocument,
                    loanAccount: loanAccountDocument,
                  },
                ],
              });

              await saveCategories(categoryDocument, unrelatedCategoryDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveTransactions(paymentTransactionDocument, deferredTransactionDocument, reimbursementTransactionDocument, splitTransactionDocument, unrelatedPaymentTransactionDocument, unrelatedDeferredTransactionDocument, unrelatedReimbursementTransactionDocument);

              const res = await requestDeleteCategory(getCategoryId(categoryDocument));
              expect(res).toBeNoContentResponse();

              expect(await findCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
              expect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(paymentTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
              expect(deferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await findTransactionById(getTransactionId(deferredTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
              expect(reimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await findTransactionById(getTransactionId(reimbursementTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
              expect(splitTransactionDocument).toHaveRelatedDocumentsChangedInSplitTransaction(await findTransactionById(getTransactionId(splitTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
              expect(unrelatedPaymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(unrelatedPaymentTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
              expect(unrelatedDeferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await findTransactionById(getTransactionId(unrelatedDeferredTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
              expect(unrelatedReimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await findTransactionById(getTransactionId(unrelatedReimbursementTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },  
              });
            });
          });
        });

        test.describe('related products', () => {
          test('should be deleted', async ({ requestDeleteCategory, saveCategories, findCategoryById, saveProducts, findProductById }) => {
            categoryDocument = categoryDataFactory.document({
              body: {
                categoryType: CategoryType.Inventory,
              },
            });
            const productDocument = productDataFactory.document({
              category: categoryDocument,
            });

            await saveCategories(categoryDocument);
            await saveProducts(productDocument);

            const res = await requestDeleteCategory(getCategoryId(categoryDocument));
            expect(res).toBeNoContentResponse();

            expect(await findCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
            expect(await findProductById(getProductId(productDocument))).toHaveBeenDeletedFromDatabase();
          });
        });

        test.describe('should return error', () => {
          test.describe('if categoryId', () => {
            test('is not mongo id', async ({ requestDeleteCategory }) => {
              const res = await requestDeleteCategory('not-valid' as Category.Id);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'categoryId');
            });
          });
        });
      }
    });
  }
});
