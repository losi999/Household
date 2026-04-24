import { getCategoryId, getProductId, getTransactionId } from '@household/shared/common/utils';
import { entries } from '@household/shared/common/utils';
import { AccountType, CategoryType } from '@household/shared/enums';
import { allowUsers } from '@household/test/utils';
import { test as categoryApiTest, expect as categoryApiExpect } from '@household/test/fixtures/category-api.fixture';
import { expect as productApiExpect } from '@household/test/fixtures/product-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { Category, Product } from '@household/shared/types/types';
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
  let sourceCategoryDocument: Category.Document;
  let targetCategoryDocument: Category.Document;

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
            expect(res).toBeCreatedResponse();

            expect(await findCategoryById(getCategoryId(sourceCategoryDocument))).toHaveBeenDeletedFromDatabase();
            
            expect(childOfSourceCategoryDocument).toHaveItsParentReassigned(await findCategoryById(getCategoryId(childOfSourceCategoryDocument)), targetCategoryDocument);
          });

          test('a category and reassign its products', async ({ requestMergeCategories, saveCategories, findCategoryById, saveProduct, findProductById }) => {
            sourceCategoryDocument = categoryDataFactory.document({
              body: {
                categoryType: CategoryType.Inventory,
              },
            });

            targetCategoryDocument = categoryDataFactory.document({
              body: {
                categoryType: CategoryType.Inventory,
              },
            });

            const productDocument = productDataFactory.document({
              category: sourceCategoryDocument,
            });

            await saveCategories(sourceCategoryDocument, targetCategoryDocument);
            await saveProduct(productDocument);

            const res = await requestMergeCategories(getCategoryId(targetCategoryDocument), [getCategoryId(sourceCategoryDocument)]);
            expect(res).toBeCreatedResponse();

            expect(await findCategoryById(getCategoryId(sourceCategoryDocument))).toHaveBeenDeletedFromDatabase();
            
            expect(productDocument).toHaveItsCategoryReassigned(await findProductById(getProductId(productDocument)), targetCategoryDocument);
          });
        });

        test.describe('in related transactions', () => {
          Object.values(CategoryType).forEach((categoryType) => {
            test(`should reassign category if merging ${categoryType} categories`, async ({ requestMergeCategories, saveAccounts, saveTransactions, findTransactionById, saveCategories, findCategoryById, saveProducts }) => {
              const accountDocument = accountDataFactory.document();
              const loanAccountDocument = accountDataFactory.document({
                accountType: AccountType.Loan,
              });

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

              const unrelatedCategoryDocument = categoryDataFactory.document({
                body: {
                  categoryType,
                },
              });
              let productOfSourceCategoryDocument: Product.Document;
              let productOfTargetCategoryDocument: Product.Document;
              let unrelatedProductDocument: Product.Document;

              if (categoryType === CategoryType.Inventory) {
                productOfSourceCategoryDocument = productDataFactory.document({
                  category: sourceCategoryDocument,
                });
                productOfTargetCategoryDocument = productDataFactory.document({
                  category: targetCategoryDocument,
                });

                unrelatedProductDocument = productDataFactory.document({
                  category: unrelatedCategoryDocument,
                });

                await saveProducts(productOfSourceCategoryDocument, productOfTargetCategoryDocument, unrelatedProductDocument);
              }

              const paymentTransactionDocument = paymentTransactionDataFactory.document({
                account: accountDocument,
                category: sourceCategoryDocument,
                product: productOfSourceCategoryDocument,
              });

              const deferredTransactionDocument = deferredTransactionDataFactory.document({
                account: accountDocument,
                category: sourceCategoryDocument,
                loanAccount: loanAccountDocument,
                product: productOfSourceCategoryDocument,
              });

              const reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
                account: loanAccountDocument,
                category: sourceCategoryDocument,
                loanAccount: accountDocument,
                product: productOfSourceCategoryDocument,
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

              const splitTransactionDocument = splitTransactionDataFactory.document({
                account: accountDocument,
                splits: [
                  {
                    category: sourceCategoryDocument,
                    product: productOfSourceCategoryDocument,
                  },
                  {
                    category: unrelatedCategoryDocument,
                    product: unrelatedProductDocument,
                  },
                ],
                loans: [
                  {
                    category: sourceCategoryDocument,
                    product: productOfSourceCategoryDocument,
                    loanAccount: loanAccountDocument,
                  },
                  {
                    category: unrelatedCategoryDocument,
                    loanAccount: loanAccountDocument,
                    product: unrelatedProductDocument,
                  },
                ],
              });

              await saveCategories(sourceCategoryDocument, targetCategoryDocument, unrelatedCategoryDocument);
              await saveAccounts(accountDocument, loanAccountDocument);
              await saveTransactions(paymentTransactionDocument, deferredTransactionDocument, reimbursementTransactionDocument, unrelatedPaymentTransactionDocument, unrelatedDeferredTransactionDocument, unrelatedReimbursementTransactionDocument, splitTransactionDocument);

              const res = await requestMergeCategories(getCategoryId(targetCategoryDocument), [getCategoryId(sourceCategoryDocument)]);
              expect(res).toBeCreatedResponse();

              expect(await findCategoryById(getCategoryId(sourceCategoryDocument))).toHaveBeenDeletedFromDatabase();
              expect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(paymentTransactionDocument)), {
                category: {
                  from: sourceCategoryDocument,
                  to: targetCategoryDocument,
                },
              });
              expect(deferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await findTransactionById(getTransactionId(deferredTransactionDocument)), {
                category: {
                  from: sourceCategoryDocument,
                  to: targetCategoryDocument,
                },
              });
              expect(reimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await findTransactionById(getTransactionId(reimbursementTransactionDocument)), {
                category: {
                  from: sourceCategoryDocument,
                  to: targetCategoryDocument,
                },
              });
              expect(splitTransactionDocument).toHaveRelatedDocumentsChangedInSplitTransaction(await findTransactionById(getTransactionId(splitTransactionDocument)), {
                category: {
                  from: sourceCategoryDocument,
                  to: targetCategoryDocument,
                },
              });
              expect(unrelatedDeferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await findTransactionById(getTransactionId(unrelatedDeferredTransactionDocument)), {
                category: {
                  from: sourceCategoryDocument,
                  to: targetCategoryDocument,
                },
              });
              expect(unrelatedReimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await findTransactionById(getTransactionId(unrelatedReimbursementTransactionDocument)), {
                category: {
                  from: sourceCategoryDocument,
                  to: targetCategoryDocument,
                },
              });
              expect(unrelatedPaymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(unrelatedPaymentTransactionDocument)), {
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
              const res = await requestMergeCategories('not-valid' as Category.Id, [categoryDataFactory.id()]);
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
