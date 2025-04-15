import { getProductId } from '@household/shared/common/utils';
import { AccountType, CategoryType } from '@household/shared/enums';
import { Account, Category, Product, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';

describe('DELETE /product/v1/products/{productId}', () => {
  let productDocument: Product.Document;
  let categoryDocument: Category.Document;

  beforeEach(() => {
    categoryDocument = categoryDataFactory.document({
      body: {
        categoryType: CategoryType.Inventory,
      },
    });
    productDocument = productDataFactory.document({
      category: categoryDocument,
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteProduct(productDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {

    it('should delete product', () => {
      cy.saveProductDocument(productDocument)
        .authenticate(1)
        .requestDeleteProduct(getProductId(productDocument))
        .expectNoContentResponse()
        .validateProductDeleted(getProductId(productDocument));
    });

    describe('in related transactions inventory', () => {
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

      beforeEach(() => {
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
      it('should be unset if product is deleted', () => {
        cy.saveAccountDocuments([
          accountDocument,
          loanAccountDocument,
        ])
          .saveCategoryDocument(categoryDocument)
          .saveProductDocuments([
            productDocument,
            unrelatedProductDocument,
          ])
          .saveTransactionDocuments([
            paymentTransactionDocument,
            splitTransactionDocument,
            deferredTransactionDocument,
            reimbursementTransactionDocument,
            unrelatedPaymentTransactionDocument,
            unrelatedDeferredTransactionDocument,
            unrelatedReimbursementTransactionDocument,
          ])
          .authenticate(1)
          .requestDeleteProduct(getProductId(productDocument))
          .expectNoContentResponse()
          .validateProductDeleted(getProductId(productDocument))
          .validateRelatedChangesInPaymentDocument(paymentTransactionDocument, {
            product: {
              from: getProductId(productDocument),
            },
          })
          .validateRelatedChangesInPaymentDocument(unrelatedPaymentTransactionDocument, {
            product: {
              from: getProductId(productDocument),
            },
          })
          .validateRelatedChangesInDeferredDocument(deferredTransactionDocument, {
            product: {
              from: getProductId(productDocument),
            },
          })
          .validateRelatedChangesInDeferredDocument(unrelatedDeferredTransactionDocument, {
            product: {
              from: getProductId(productDocument),
            },
          })
          .validateRelatedChangesInReimbursementDocument(reimbursementTransactionDocument, {
            product: {
              from: getProductId(productDocument),
            },
          })
          .validateRelatedChangesInReimbursementDocument(unrelatedReimbursementTransactionDocument, {
            product: {
              from: getProductId(productDocument),
            },
          })
          .validateRelatedChangesInSplitDocument(splitTransactionDocument, {
            product: {
              from: getProductId(productDocument),
            },
          });
      });
    });

    describe('should return error', () => {
      describe('if productId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestDeleteProduct(productDataFactory.id('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('productId', 'pathParameters');
        });
      });
    });
  });
});
