import { entries, getProductId, getTransactionId } from '@household/shared/common/utils';
import { AccountType, CategoryType } from '@household/shared/enums';
import { Account, Category, Product, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { allowUsers } from '@household/test/utils';
import { expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { test as productApiTest, expect as productApiExpect } from '@household/test/fixtures/product-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { test as transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { test as categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { test as productDbTest } from '@household/test/fixtures/product-db.fixture';

const expect = mergeExpects(productApiExpect, apiExpect, transactionApiExpect);

const permissionMap = allowUsers('editor') ;

const test = mergeTests(productApiTest, accountDbTest, transactionDbTest, categoryDbTest, productDbTest);

test.describe('DELETE /product/v1/products/{productId}', () => {
  let productDocument: Product.Document;
  let categoryDocument: Category.Document;

  test.beforeEach(async () => {
    categoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });
    productDocument = productDataFactory.document({
      category: categoryDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteProduct }) => {
      const res = await requestDeleteProduct(productDataFactory.id());
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
        test('should return forbidden', async ({ requestDeleteProduct }) => {
          const res = await requestDeleteProduct(productDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete product', async ({ requestDeleteProduct, saveProduct, findProductById }) => {
          await saveProduct(productDocument);
          const res = await requestDeleteProduct(getProductId(productDocument));
          expect(res).toBeNoContentResponse();

          expect(await findProductById(getProductId(productDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('in related transactions inventory', () => {
          let unrelatedProductDocument: Product.Document;
          let paymentTransactionDocument: Transaction.PaymentDocument;
          let deferredTransactionDocument: Transaction.DeferredDocument;
          let reimbursementTransactionDocument: Transaction.ReimbursementDocument;
          let splitTransactionDocument: Transaction.SplitDocument;
          let unrelatedPaymentTransactionDocument: Transaction.PaymentDocument;
          let unrelatedDeferredTransactionDocument: Transaction.DeferredDocument;
          let unrelatedReimbursementTransactionDocument: Transaction.ReimbursementDocument;
          let accountDocument: Account.Document;
          let loanAccountDocument: Account.Document;

          test.beforeEach(async () => {
            accountDocument = accountDataFactory.document();
            loanAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });

            unrelatedProductDocument = productDataFactory.document({
              category: categoryDocument,
            });

            paymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
              category: categoryDocument,
              product: productDocument,
            });

            unrelatedPaymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
              category: categoryDocument,
              product: unrelatedProductDocument,
            });

            deferredTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              category: categoryDocument,
              product: productDocument,
              loanAccount: loanAccountDocument,
            });

            unrelatedDeferredTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              category: categoryDocument,
              product: unrelatedProductDocument,
              loanAccount: loanAccountDocument,
            });

            reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
              account: loanAccountDocument,
              category: categoryDocument,
              product: productDocument,
              loanAccount: accountDocument,
            });

            unrelatedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
              account: loanAccountDocument,
              category: categoryDocument,
              product: unrelatedProductDocument,
              loanAccount: accountDocument,
            });

            splitTransactionDocument = splitTransactionDataFactory.document({
              account: accountDocument,
              splits: [
                {
                  product: unrelatedProductDocument,
                  category: categoryDocument,
                },
                {
                  product: productDocument,
                  category: categoryDocument,
                },
              ],
              loans: [
                {
                  product: unrelatedProductDocument,
                  category: categoryDocument,
                  loanAccount: loanAccountDocument,
                },
                {
                  product: productDocument,
                  category: categoryDocument,
                  loanAccount: loanAccountDocument,
                },
              ],
            });
          });
          test('should be unset if product is deleted', async ({ requestDeleteProduct, saveAccounts, saveTransactions, findTransactionById, saveCategory, saveProducts, findProductById }) => {
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveCategory(categoryDocument);
            await saveProducts(productDocument, unrelatedProductDocument);
            await saveTransactions(paymentTransactionDocument, splitTransactionDocument, deferredTransactionDocument, reimbursementTransactionDocument, unrelatedPaymentTransactionDocument, unrelatedDeferredTransactionDocument, unrelatedReimbursementTransactionDocument);
            const res = await requestDeleteProduct(getProductId(productDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findProductById(getProductId(productDocument))).toHaveBeenDeletedFromDatabase();
            expect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(paymentTransactionDocument)), {
              product: {
                from: getProductId(productDocument),
              },
            });
            expect(unrelatedPaymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(unrelatedPaymentTransactionDocument)), {
              product: {
                from: getProductId(productDocument),
              },
            });
            expect(deferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await findTransactionById(getTransactionId(deferredTransactionDocument)), {
              product: {
                from: getProductId(productDocument),
              },
            });
            expect(unrelatedDeferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await findTransactionById(getTransactionId(unrelatedDeferredTransactionDocument)), {
              product: {
                from: getProductId(productDocument),
              },
            });
            expect(reimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await findTransactionById(getTransactionId(reimbursementTransactionDocument)), {
              product: {
                from: getProductId(productDocument),
              },
            });
            expect(unrelatedReimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await findTransactionById(getTransactionId(unrelatedReimbursementTransactionDocument)), {
              product: {
                from: getProductId(productDocument),
              },
            });
            expect(splitTransactionDocument).toHaveRelatedDocumentsChangedInSplitTransaction(await findTransactionById(getTransactionId(splitTransactionDocument)), {
              product: {
                from: getProductId(productDocument),
              },
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if productId', () => {
            test('is not mongo id', async ({ requestDeleteProduct }) => {
              const res = await requestDeleteProduct(productDataFactory.id('not-valid'));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'productId');
            });
          });
        });
      }
    });
  });
});
