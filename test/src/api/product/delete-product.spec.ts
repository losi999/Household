import { entries, getProductId, getTransactionId } from '@household/shared/common/utils';
import { AccountType, CategoryType } from '@household/shared/enums';
import { Documents } from '@household/shared/types/documents';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { loanTransactionDataFactory } from '@household/test/api/transaction/loan/loan-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { allowUsers } from '@household/test/utils';
import { transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { productApiTest, productApiExpect } from '@household/test/fixtures/product-api.fixture';
import { mergeTests } from '@playwright/test';
import { accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { productDbTest } from '@household/test/fixtures/product-db.fixture';

const permissionMap = allowUsers('editor') ;

const test = mergeTests(productApiTest, accountDbTest, transactionDbTest, categoryDbTest, productDbTest);

test.describe('DELETE /product/v1/products/{productId}', () => {
  let productDocument: Documents.Product;

  test.beforeEach(async () => {
    productDocument = productDataFactory.document.generic();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteProduct }) => {
      const res = await requestDeleteProduct(productDataFactory.id());
      productApiExpect(res).toBeUnauthorizedResponse();
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
        test('should return forbidden', async ({ requestDeleteProduct }) => {
          const res = await requestDeleteProduct(productDataFactory.id());
          productApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete product', async ({ requestDeleteProduct, saveProduct, findProductById }) => {
          await saveProduct(productDocument);
          const res = await requestDeleteProduct(getProductId(productDocument));
          productApiExpect(res).toBeNoContentResponse();

          productApiExpect(await findProductById(getProductId(productDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('should unset inventory in related', () => {
          let categoryDocument: Documents.Category;
          let accountDocument: Documents.Account;
          let loanAccountDocument: Documents.Account;

          test.beforeEach(async () => {
            accountDocument = accountDataFactory.document();
            categoryDocument = categoryDataFactory.document({
              body: {
                categoryType: CategoryType.Inventory,
              },
            });
            loanAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });
          });

          test('payment transaction', async ({ requestDeleteProduct, saveAccounts, saveTransactions, findTransactionById, saveCategory, saveProducts, findProductById }) => {
            const paymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
              category: categoryDocument,
              product: productDocument,
            });

            await saveAccounts(accountDocument);
            await saveCategory(categoryDocument);
            await saveProducts(productDocument);
            await saveTransactions(paymentTransactionDocument);
            const res = await requestDeleteProduct(getProductId(productDocument));
            productApiExpect(res).toBeNoContentResponse();
            
            productApiExpect(await findProductById(getProductId(productDocument))).toHaveBeenDeletedFromDatabase();
            transactionApiExpect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(paymentTransactionDocument)), {
              product: {
                from: getProductId(productDocument),
              },
            });
          });

          test('loan transaction', async ({ requestDeleteProduct, saveAccounts, saveTransactions, findTransactionById, saveCategory, saveProducts, findProductById }) => {
            const loanTransactionDocument = loanTransactionDataFactory.document({
              account: accountDocument,
              category: categoryDocument,
              product: productDocument,
              loanAccount: loanAccountDocument,
            });

            await saveAccounts(accountDocument, loanAccountDocument);
            await saveCategory(categoryDocument);
            await saveProducts(productDocument);
            await saveTransactions(loanTransactionDocument);
            const res = await requestDeleteProduct(getProductId(productDocument));
            productApiExpect(res).toBeNoContentResponse();
            
            productApiExpect(await findProductById(getProductId(productDocument))).toHaveBeenDeletedFromDatabase();
            transactionApiExpect(loanTransactionDocument).toHaveRelatedDocumentsChangedInLoanTransaction(await findTransactionById(getTransactionId(loanTransactionDocument)), {
              product: {
                from: getProductId(productDocument),
              },
            });
          });

          test('repayment transaction', async ({ requestDeleteProduct, saveAccounts, saveTransactions, findTransactionById, saveCategory, saveProducts, findProductById }) => {
            const repaymentTransactionDocument = loanTransactionDataFactory.document({
              account: loanAccountDocument,
              category: categoryDocument,
              product: productDocument,
              loanAccount: accountDocument,
            });

            await saveAccounts(accountDocument, loanAccountDocument);
            await saveCategory(categoryDocument);
            await saveProducts(productDocument);
            await saveTransactions(repaymentTransactionDocument);
            const res = await requestDeleteProduct(getProductId(productDocument));
            productApiExpect(res).toBeNoContentResponse();
            
            productApiExpect(await findProductById(getProductId(productDocument))).toHaveBeenDeletedFromDatabase();
            transactionApiExpect(repaymentTransactionDocument).toHaveRelatedDocumentsChangedInLoanTransaction(await findTransactionById(getTransactionId(repaymentTransactionDocument)), {
              product: {
                from: getProductId(productDocument),
              },
            });
          });

          test('split transaction', async ({ requestDeleteProduct, saveAccounts, saveTransactions, findTransactionById, saveCategory, saveProducts, findProductById }) => {
            const splitTransactionDocument = splitTransactionDataFactory.document({
              account: accountDocument,
              splits: [
                {
                  product: productDocument,
                  category: categoryDocument,
                },
              ],
              loans: [
                {
                  product: productDocument,
                  category: categoryDocument,
                  loanAccount: loanAccountDocument,
                },
              ],
            });

            await saveAccounts(accountDocument, loanAccountDocument);
            await saveCategory(categoryDocument);
            await saveProducts(productDocument);
            await saveTransactions(splitTransactionDocument);
            const res = await requestDeleteProduct(getProductId(productDocument));
            productApiExpect(res).toBeNoContentResponse();
            
            productApiExpect(await findProductById(getProductId(productDocument))).toHaveBeenDeletedFromDatabase();
            transactionApiExpect(splitTransactionDocument).toHaveRelatedDocumentsChangedInSplitTransaction(await findTransactionById(getTransactionId(splitTransactionDocument)), {
              product: {
                from: getProductId(productDocument),
              },
            });
          });
        });

        test.describe('should return error', () => {
          test('if generic product has child product', async({ requestDeleteProduct, saveProducts }) => {
            const genericProduct = productDataFactory.document.generic();
            const specificProduct = productDataFactory.document.specific({
              genericProduct,
            });

            await saveProducts(genericProduct, specificProduct);
            const res = await requestDeleteProduct(getProductId(genericProduct));
            productApiExpect(res).toBeBadRequestResponse();
            productApiExpect(res).toHaveMessage('Product cannot be deleted if there are child products');
          });

          test('if specific product has child product', async({ requestDeleteProduct, saveProducts }) => {
            const genericProduct = productDataFactory.document.generic();
            const specificProduct = productDataFactory.document.specific({
              genericProduct,
            });
            const variandProduct = productDataFactory.document.variant({
              genericProduct,
              specificProduct,
            });

            await saveProducts(genericProduct, specificProduct, variandProduct);
            const res = await requestDeleteProduct(getProductId(specificProduct));
            productApiExpect(res).toBeBadRequestResponse();
            productApiExpect(res).toHaveMessage('Product cannot be deleted if there are child products');
          });

          test.describe('if productId', () => {
            test('is not mongo id', async ({ requestDeleteProduct }) => {
              const res = await requestDeleteProduct(productDataFactory.id('not-valid'));
              productApiExpect(res).toBeBadRequestResponse();
              productApiExpect(res).toHavePatternValidationError('pathParameters', 'productId');
            });
          });
        });
      }
    });
  });
});
