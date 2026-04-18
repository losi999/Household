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
import { test, expect as productApiExpect } from '@household/test/fixtures/product-api.fixture';
import { expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { accountService, categoryService, productService, transactionService } from '@household/test/dependencies';

const expect = mergeExpects(productApiExpect, transactionApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

test.describe('POST product/v1/products/{productId}/merge', () => {
  let accountDocument: Account.Document;
  let loanAccountDocument: Account.Document;
  let categoryDocument: Category.Document;
  let targetProductDocument: Product.Document;
  let sourceProductDocument: Product.Document;
  let unrelatedProductDocument: Product.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let deferredTransactionDocument: Transaction.DeferredDocument;
  let reimbursementTransactionDocument: Transaction.ReimbursementDocument;
  let splitTransactionDocument: Transaction.SplitDocument;
  let unrelatedPaymentTransactionDocument: Transaction.PaymentDocument;
  let unrelatedDeferredTransactionDocument: Transaction.DeferredDocument;
  let unrelatedReimbursementTransactionDocument: Transaction.ReimbursementDocument;

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

    targetProductDocument = productDataFactory.document({
      category: categoryDocument,
    });
    sourceProductDocument = productDataFactory.document({
      category: categoryDocument,
    });
    unrelatedProductDocument = productDataFactory.document({
      category: categoryDocument,
    });

    paymentTransactionDocument = paymentTransactionDataFactory.document({
      account: accountDocument,
      category: categoryDocument,
      product: sourceProductDocument,
    });

    unrelatedPaymentTransactionDocument = paymentTransactionDataFactory.document({
      account: accountDocument,
      category: categoryDocument,
      product: unrelatedProductDocument,
    });

    deferredTransactionDocument = deferredTransactionDataFactory.document({
      account: accountDocument,
      category: categoryDocument,
      product: sourceProductDocument,
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
      product: sourceProductDocument,
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
          product: sourceProductDocument,
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
          product: sourceProductDocument,
          category: categoryDocument,
          loanAccount: loanAccountDocument,
        },
      ],
    });
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
        test('should merge products', async ({ requestMergeProducts }) => {
          await accountService.saveAccounts(accountDocument, loanAccountDocument);
          await categoryService.saveCategory(categoryDocument);
          await productService.saveProducts(sourceProductDocument, targetProductDocument, unrelatedProductDocument);
          await transactionService.saveTransactions(paymentTransactionDocument, splitTransactionDocument, deferredTransactionDocument, reimbursementTransactionDocument, unrelatedPaymentTransactionDocument, unrelatedDeferredTransactionDocument, unrelatedReimbursementTransactionDocument);

          const res = await requestMergeProducts(getProductId(targetProductDocument), [getProductId(sourceProductDocument)]);
          expect(res).toBeCreatedResponse();

          expect(await productService.findProductById(getProductId(sourceProductDocument))).toHaveBeenDeletedFromDatabase();
          expect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await transactionService.findTransactionById(getTransactionId(paymentTransactionDocument)), {
            product: {
              from: getProductId(sourceProductDocument),
              to: getProductId(targetProductDocument),
            },
          });
          expect(unrelatedPaymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedPaymentTransactionDocument)), {
            product: {
              from: getProductId(sourceProductDocument),
              to: getProductId(targetProductDocument),
            },
          });
          expect(deferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await transactionService.findTransactionById(getTransactionId(deferredTransactionDocument)), {
            product: {
              from: getProductId(sourceProductDocument),
              to: getProductId(targetProductDocument),
            },
          });
          expect(unrelatedDeferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedDeferredTransactionDocument)), {
            product: {
              from: getProductId(sourceProductDocument),
              to: getProductId(targetProductDocument),
            },
          });
          expect(reimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await transactionService.findTransactionById(getTransactionId(reimbursementTransactionDocument)), {
            product: {
              from: getProductId(sourceProductDocument),
              to: getProductId(targetProductDocument),
            },
          });
          expect(unrelatedReimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedReimbursementTransactionDocument)), {
            product: {
              from: getProductId(sourceProductDocument),
              to: getProductId(targetProductDocument),
            },
          });
          expect(splitTransactionDocument).toHaveRelatedDocumentsChangedInSplitTransaction(await transactionService.findTransactionById(getTransactionId(splitTransactionDocument)), {
            product: {
              from: getProductId(sourceProductDocument),
              to: getProductId(targetProductDocument),
            },
          });
        });

        test.describe('should return error', () => {
          test('if products do not belong to the same category', async ({ requestMergeProducts }) => {
            const otherCategory = categoryDataFactory.document({
              body: {
                categoryType: CategoryType.Inventory,
              },
            });

            sourceProductDocument = productDataFactory.document({
              category: otherCategory,
            });

            await categoryService.saveCategory(categoryDocument);
            await categoryService.saveCategory(otherCategory);
            await productService.saveProduct(targetProductDocument);
            await productService.saveProduct(sourceProductDocument);
            const res = await requestMergeProducts(getProductId(targetProductDocument), [getProductId(sourceProductDocument)]);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Not all products belong to the same category');
          });

          test('if a source product does not exist', async ({ requestMergeProducts }) => {
            await categoryService.saveCategory(categoryDocument);
            await productService.saveProduct(targetProductDocument);
            await productService.saveProduct(sourceProductDocument);
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
