import { entries, getProductId, getTransactionId } from '@household/shared/common/utils';
import { AccountType, CategoryType } from '@household/shared/enums';
import { Documents } from '@household/shared/types/documents';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { allowUsers } from '@household/test/utils';
import { test as productApiTest, expect as productApiExpect } from '@household/test/fixtures/product-api.fixture';
import { expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { test as transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { test as categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { test as productDbTest } from '@household/test/fixtures/product-db.fixture';

const expect = mergeExpects(productApiExpect, transactionApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

const test = mergeTests(productApiTest, accountDbTest, transactionDbTest, categoryDbTest, productDbTest);

test.describe('POST product/v1/products/{productId}/merge', () => {
  let accountDocument: Documents.Account;
  let loanAccountDocument: Documents.Account;
  let categoryDocument: Documents.Category;
  let targetProductDocument: Documents.Product;
  let sourceProductDocument: Documents.Product;

  test.beforeEach(async () => {
    accountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: AccountType.Loan,
    });

    categoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });

    targetProductDocument = productDataFactory.document.generic();
    sourceProductDocument = productDataFactory.document.generic();
    
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestMergeProducts }) => {
      const res = await requestMergeProducts(productDataFactory.id(), [productDataFactory.id()]);
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
        test('should return forbidden', async ({ requestMergeProducts }) => {
          const res = await requestMergeProducts(productDataFactory.id(), [productDataFactory.id()]);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should merge products', async ({ requestMergeProducts, saveProducts, findProductById }) => {
          await saveProducts(sourceProductDocument, targetProductDocument);

          const res = await requestMergeProducts(getProductId(targetProductDocument), [getProductId(sourceProductDocument)]);
          expect(res).toBeNoContentResponse();

          expect(await findProductById(getProductId(sourceProductDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('children should be reassigned', () => {
          test('of a generic product', async ({ requestMergeProducts, saveProducts, findProductById }) => {
            const specificProduct = productDataFactory.document.specific({
              genericProduct: sourceProductDocument as Documents.GenericProduct,
            });
            const variantProduct = productDataFactory.document.variant({
              genericProduct: sourceProductDocument as Documents.GenericProduct,
              specificProduct,
            });

            await saveProducts(sourceProductDocument, targetProductDocument, specificProduct, variantProduct);
            const res = await requestMergeProducts(getProductId(targetProductDocument), [getProductId(sourceProductDocument)]);
            expect(res).toBeNoContentResponse();

            expect(await findProductById(getProductId(sourceProductDocument))).toHaveBeenDeletedFromDatabase();
            expect(specificProduct).toHaveItsGenericProductReassigned(await findProductById(getProductId(specificProduct)), targetProductDocument);
            expect(variantProduct).toHaveItsGenericProductReassigned(await findProductById(getProductId(variantProduct)), targetProductDocument);

          });

          test('of a specific product', async ({ requestMergeProducts, saveProducts, findProductById }) => {
            const genericProduct = productDataFactory.document.generic();
            sourceProductDocument = productDataFactory.document.specific({
              genericProduct,
            });

            targetProductDocument = productDataFactory.document.specific({
              genericProduct,
            });
            const variantProduct = productDataFactory.document.variant({
              genericProduct,
              specificProduct: sourceProductDocument,
            });

            await saveProducts(sourceProductDocument, targetProductDocument, genericProduct, variantProduct);
            const res = await requestMergeProducts(getProductId(targetProductDocument), [getProductId(sourceProductDocument)]);
            expect(res).toBeNoContentResponse();

            expect(await findProductById(getProductId(sourceProductDocument))).toHaveBeenDeletedFromDatabase();
            expect(variantProduct).toHaveItsSpecificProductReassigned(await findProductById(getProductId(variantProduct)), targetProductDocument);

          });
        });

        test.describe('product should be reassigned in related', () => {
          test('payment transaction', async ({ requestMergeProducts, saveAccounts, saveTransactions, findTransactionById, saveCategory, saveProducts, findProductById }) => {
            const paymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
              category: categoryDocument,
              product: sourceProductDocument,
            });

            await saveAccounts(accountDocument);
            await saveCategory(categoryDocument);
            await saveProducts(sourceProductDocument, targetProductDocument);
            await saveTransactions(paymentTransactionDocument);

            const res = await requestMergeProducts(getProductId(targetProductDocument), [getProductId(sourceProductDocument)]);
            expect(res).toBeNoContentResponse();

            expect(await findProductById(getProductId(sourceProductDocument))).toHaveBeenDeletedFromDatabase();
            expect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(paymentTransactionDocument)), {
              product: {
                from: getProductId(sourceProductDocument),
                to: getProductId(targetProductDocument),
              },
            });
          });

          test('deferred transaction', async ({ requestMergeProducts, saveAccounts, saveTransactions, findTransactionById, saveCategory, saveProducts, findProductById }) => {
            const deferredTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              category: categoryDocument,
              product: sourceProductDocument,
              loanAccount: loanAccountDocument,
            });
    
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveCategory(categoryDocument);
            await saveProducts(sourceProductDocument, targetProductDocument);
            await saveTransactions(deferredTransactionDocument);

            const res = await requestMergeProducts(getProductId(targetProductDocument), [getProductId(sourceProductDocument)]);
            expect(res).toBeNoContentResponse();

            expect(await findProductById(getProductId(sourceProductDocument))).toHaveBeenDeletedFromDatabase();
            expect(deferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await findTransactionById(getTransactionId(deferredTransactionDocument)), {
              product: {
                from: getProductId(sourceProductDocument),
                to: getProductId(targetProductDocument),
              },
            });
          });

          test('reimbursement transaction', async ({ requestMergeProducts, saveAccounts, saveTransactions, findTransactionById, saveCategory, saveProducts, findProductById }) => {
            const reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
              account: loanAccountDocument,
              category: categoryDocument,
              product: sourceProductDocument,
              loanAccount: accountDocument,
            });

            await saveAccounts(accountDocument, loanAccountDocument);
            await saveCategory(categoryDocument);
            await saveProducts(sourceProductDocument, targetProductDocument);
            await saveTransactions(reimbursementTransactionDocument);

            const res = await requestMergeProducts(getProductId(targetProductDocument), [getProductId(sourceProductDocument)]);
            expect(res).toBeNoContentResponse();

            expect(await findProductById(getProductId(sourceProductDocument))).toHaveBeenDeletedFromDatabase();
            expect(reimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await findTransactionById(getTransactionId(reimbursementTransactionDocument)), {
              product: {
                from: getProductId(sourceProductDocument),
                to: getProductId(targetProductDocument),
              },
            });
          });

          test('split transaction', async ({ requestMergeProducts, saveAccounts, saveTransactions, findTransactionById, saveCategory, saveProducts, findProductById }) => {
            const splitTransactionDocument = splitTransactionDataFactory.document({
              account: accountDocument,
              splits: [
                {
                  product: sourceProductDocument,
                  category: categoryDocument,
                },
              ],
              loans: [
                {
                  product: sourceProductDocument,
                  category: categoryDocument,
                  loanAccount: loanAccountDocument,
                },
              ],
            });
    
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveCategory(categoryDocument);
            await saveProducts(sourceProductDocument, targetProductDocument);
            await saveTransactions(splitTransactionDocument);

            const res = await requestMergeProducts(getProductId(targetProductDocument), [getProductId(sourceProductDocument)]);
            expect(res).toBeNoContentResponse();

            expect(await findProductById(getProductId(sourceProductDocument))).toHaveBeenDeletedFromDatabase();
            expect(splitTransactionDocument).toHaveRelatedDocumentsChangedInSplitTransaction(await findTransactionById(getTransactionId(splitTransactionDocument)), {
              product: {
                from: getProductId(sourceProductDocument),
                to: getProductId(targetProductDocument),
              },
            });
          });
        });

        test.describe('should return error', () => {
          test('if products do not belong to the same type', async ({ requestMergeProducts, saveProducts }) => {
            const genericProductDocument = productDataFactory.document.generic();
            sourceProductDocument = productDataFactory.document.specific({
              genericProduct: genericProductDocument,
            });

            await saveProducts(genericProductDocument, sourceProductDocument);
            const res = await requestMergeProducts(getProductId(genericProductDocument), [getProductId(sourceProductDocument)]);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Not all products are of the same type');
          });

          test('if specific products do not belong to the same parent', async ({ requestMergeProducts, saveProducts }) => {
            const parentOfSource = productDataFactory.document.generic();
            sourceProductDocument = productDataFactory.document.specific({
              genericProduct: parentOfSource,
            });
            const parentOfTarget = productDataFactory.document.generic();
            targetProductDocument = productDataFactory.document.specific({
              genericProduct: parentOfTarget,
            });

            await saveProducts(targetProductDocument, sourceProductDocument, parentOfSource, parentOfTarget);
            const res = await requestMergeProducts(getProductId(targetProductDocument), [getProductId(sourceProductDocument)]);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Not all products are siblings');
          });

          test('if variant products do not belong to the same parent', async ({ requestMergeProducts, saveProducts }) => {
            const genericProduct = productDataFactory.document.generic();
            const parentOfSource = productDataFactory.document.specific({
              genericProduct,
            });
            sourceProductDocument = productDataFactory.document.variant({
              genericProduct,
              specificProduct: parentOfSource,
            });
            const parentOfTarget = productDataFactory.document.specific({
              genericProduct,
            });
            targetProductDocument = productDataFactory.document.variant({
              genericProduct,
              specificProduct: parentOfTarget,
            });

            await saveProducts(targetProductDocument, sourceProductDocument, parentOfSource, parentOfTarget, genericProduct);
            const res = await requestMergeProducts(getProductId(targetProductDocument), [getProductId(sourceProductDocument)]);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Not all products are siblings');
          });

          test('if a source product does not exist', async ({ requestMergeProducts, saveCategory, saveProduct }) => {
            await saveCategory(categoryDocument);
            await saveProduct(targetProductDocument);
            await saveProduct(sourceProductDocument);
            const res = await requestMergeProducts(getProductId(targetProductDocument), [
              getProductId(sourceProductDocument),
              productDataFactory.id(), 
            ]);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Some of the products are not found');
          });

          test.describe('if body', () => {
            test('is not array', async ({ requestMergeProducts }) => {
              const res = await requestMergeProducts(productDataFactory.id(), {} as any);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'data', 'array');
            });

            test('has too few items', async ({ requestMergeProducts }) => {
              const res = await requestMergeProducts(productDataFactory.id(), []);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooFewItemsValidationError('body', 'data', 1);
            });
          });

          test.describe('if body[0]', () => {
            test('is not string', async ({ requestMergeProducts }) => {
              const res = await requestMergeProducts(productDataFactory.id(), [1] as any);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'data/0', 'string');
            });

            test('is not a valid mongo id', async ({ requestMergeProducts }) => {
              const res = await requestMergeProducts(productDataFactory.id(), [productDataFactory.id('not-valid')]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'data/0');
            });
          });

          test.describe('if productId', () => {
            test('is not a valid mongo id', async ({ requestMergeProducts }) => {
              const res = await requestMergeProducts(productDataFactory.id('not-valid'), [productDataFactory.id()]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'productId');
            });

            test('does not belong to any product', async ({ requestMergeProducts }) => {
              const res = await requestMergeProducts(productDataFactory.id(), [getProductId(sourceProductDocument)]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the products are not found');
            });
          });
        });
      }
    });
  });
});
