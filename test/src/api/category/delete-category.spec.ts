import { getCategoryId, getProductId, getTransactionId } from '@household/shared/common/utils';
import { entries } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { test, expect as categoryApiExpect } from '@household/test/fixtures/category-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { expect as paymentTransactionApiExpect } from '@household/test/fixtures/payment-transaction-api.fixture';
import { expect as deferredTransactionApiExpect } from '@household/test/fixtures/deferred-transaction-api.fixture';
import { expect as reimbursementTransactionApiExpect } from '@household/test/fixtures/reimbursement-transaction-api.fixture';
import { expect as splitTransactionApiExpect } from '@household/test/fixtures/split-transaction-api.fixture';
import { expect as productApiExpect } from '@household/test/fixtures/product-api.fixture';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { Category, Product } from '@household/shared/types/types';
import { mergeExpects } from '@playwright/test';
import { categoryService } from '@household/test/dependencies';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { AccountType, CategoryType } from '@household/shared/enums';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { accountService } from '@household/test/dependencies';
import { transactionService } from '@household/test/dependencies';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { productService } from '@household/test/dependencies';

const permissionMap = allowUsers('editor');

const expect = mergeExpects(categoryApiExpect, apiExpect, paymentTransactionApiExpect, deferredTransactionApiExpect, reimbursementTransactionApiExpect, splitTransactionApiExpect, productApiExpect);

test.describe('DELETE /category/v1/categories/{categoryId}', () => {
  let categoryDocument: Category.Document;

  test.beforeEach(() => {
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
        test('should delete category', async ({ requestDeleteCategory }) => {
          await categoryService.saveCategory(categoryDocument);

          const res = await requestDeleteCategory(getCategoryId(categoryDocument));
          expect(res).toBeNoContentResponse();

          expect(await categoryService.getCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('children should be reassigned', () => {
          let childCategory: Category.Document;
          let grandChildCategory: Category.Document;

          test.beforeEach(() => {
            childCategory = categoryDataFactory.document({
              parentCategory: categoryDocument,
            });

            grandChildCategory = categoryDataFactory.document({
              parentCategory: childCategory,
            });
          });

          test('to root if did not have parent', async ({ requestDeleteCategory }) => {
            await categoryService.saveCategories(categoryDocument, childCategory, grandChildCategory);

            const res = await requestDeleteCategory(getCategoryId(categoryDocument));
            expect(res).toBeNoContentResponse();

            expect(await categoryService.getCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
            expect(childCategory).toHaveItsParentReassigned(await categoryService.getCategoryById(getCategoryId(childCategory)));
            expect(grandChildCategory).toHaveItsParentReassigned(await categoryService.getCategoryById(getCategoryId(grandChildCategory)), await categoryService.getCategoryById(getCategoryId(childCategory)));
          });

          test('to parent if had parent', async ({ requestDeleteCategory }) => {
            await categoryService.saveCategories(categoryDocument, childCategory, grandChildCategory);

            const res = await requestDeleteCategory(getCategoryId(childCategory));
            expect(res).toBeNoContentResponse();

            expect(await categoryService.getCategoryById(getCategoryId(childCategory))).toHaveBeenDeletedFromDatabase();
            expect(grandChildCategory).toHaveItsParentReassigned(await categoryService.getCategoryById(getCategoryId(grandChildCategory)), categoryDocument);
          });
        });

        test.describe('in related transactions', () => {
          Object.values(CategoryType).forEach((categoryType) => {
            test(`should category be unset if ${categoryType} category is deleted`, async ({ requestDeleteCategory }) => {
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

                await productService.saveProducts(productDocument, unrelatedProductDocument);
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

              await categoryService.saveCategories(categoryDocument, unrelatedCategoryDocument);
              await accountService.saveAccounts(accountDocument, loanAccountDocument);
              await transactionService.saveTransactions(paymentTransactionDocument, deferredTransactionDocument, reimbursementTransactionDocument, splitTransactionDocument, unrelatedPaymentTransactionDocument, unrelatedDeferredTransactionDocument, unrelatedReimbursementTransactionDocument);

              const res = await requestDeleteCategory(getCategoryId(categoryDocument));
              expect(res).toBeNoContentResponse();

              expect(await categoryService.getCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
              expect(paymentTransactionDocument).toChangeRelatedDocumentsChangedInPaymentTransaction(await transactionService.findTransactionById(getTransactionId(paymentTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
              expect(deferredTransactionDocument).toChangeRelatedDocumentsChangedInDeferredTransaction(await transactionService.findTransactionById(getTransactionId(deferredTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
              expect(reimbursementTransactionDocument).toChangeRelatedDocumentsChangedInReimbursementTransaction(await transactionService.findTransactionById(getTransactionId(reimbursementTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
              expect(splitTransactionDocument).toChangeRelatedDocumentsChangedInSplitTransaction(await transactionService.findTransactionById(getTransactionId(splitTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
              expect(unrelatedPaymentTransactionDocument).toChangeRelatedDocumentsChangedInPaymentTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedPaymentTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
              expect(unrelatedDeferredTransactionDocument).toChangeRelatedDocumentsChangedInDeferredTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedDeferredTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },
              });
              expect(unrelatedReimbursementTransactionDocument).toChangeRelatedDocumentsChangedInReimbursementTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedReimbursementTransactionDocument)), {
                category: {
                  from: categoryDocument,
                },  
              });
            });
          });
        });

        test.describe('related products', () => {
          test('should be deleted', async ({ requestDeleteCategory }) => {
            categoryDocument = categoryDataFactory.document({
              body: {
                categoryType: CategoryType.Inventory,
              },
            });
            const productDocument = productDataFactory.document({
              category: categoryDocument,
            });

            await categoryService.saveCategories(categoryDocument);
            await productService.saveProducts(productDocument);

            const res = await requestDeleteCategory(getCategoryId(categoryDocument));
            expect(res).toBeNoContentResponse();

            expect(await categoryService.getCategoryById(getCategoryId(categoryDocument))).toHaveBeenDeletedFromDatabase();
            expect(await productService.findProductById(getProductId(productDocument))).toHaveBeenDeletedFromDatabase();
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
