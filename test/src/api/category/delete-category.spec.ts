import { createCategoryId } from '@household/shared/common/test-data-factory';
import { getCategoryId, getProductId } from '@household/shared/common/utils';
import { AccountType, CategoryType } from '@household/shared/enums';
import { Account, Category, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';

describe('DELETE /category/v1/categories/{categoryId}', () => {
  let categoryDocument: Category.Document;

  beforeEach(() => {
    categoryDocument = categoryDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteCategory(createCategoryId())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should delete category', () => {
      cy.saveCategoryDocument(categoryDocument)
        .authenticate(1)
        .requestDeleteCategory(getCategoryId(categoryDocument))
        .expectNoContentResponse()
        .validateCategoryDeleted(getCategoryId(categoryDocument));
    });

    describe('children should be reassigned', () => {
      let childCategory: Category.Document;
      let grandChildCategory: Category.Document;

      beforeEach(() => {
        childCategory = categoryDataFactory.document({
          parentCategory: categoryDocument,
        });

        grandChildCategory = categoryDataFactory.document({
          parentCategory: childCategory,
        });
      });

      it('to root if did not have parent', () => {
        cy.saveCategoryDocuments([
          categoryDocument,
          childCategory,
          grandChildCategory,
        ])
          .authenticate(1)
          .requestDeleteCategory(getCategoryId(categoryDocument))
          .expectNoContentResponse()
          .validateCategoryDeleted(getCategoryId(categoryDocument))
          .validateCategoryParentReassign(childCategory)
          .validateCategoryParentReassign(grandChildCategory, getCategoryId(childCategory));
      });

      it('to parent if had parent', () => {
        cy.saveCategoryDocuments([
          categoryDocument,
          childCategory,
          grandChildCategory,
        ])
          .authenticate(1)
          .requestDeleteCategory(getCategoryId(childCategory))
          .expectNoContentResponse()
          .validateCategoryDeleted(getCategoryId(childCategory))
          .validateCategoryParentReassign(grandChildCategory, getCategoryId(categoryDocument));
      });
    });

    describe('in related transactions', () => {
      let unrelatedCategoryDocument: Category.Document;
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
      });

      it('category should be unset if category is deleted', () => {
        unrelatedCategoryDocument = categoryDataFactory.document();

        unrelatedPaymentTransactionDocument = paymentTransactionDataFactory.document({
          account: accountDocument,
          category: unrelatedCategoryDocument,
        });

        unrelatedDeferredTransactionDocument = deferredTransactionDataFactory.document({
          account: accountDocument,
          category: unrelatedCategoryDocument,
          loanAccount: loanAccountDocument,
        });

        unrelatedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
          account: loanAccountDocument,
          category: unrelatedCategoryDocument,
          loanAccount: accountDocument,
        });

        paymentTransactionDocument = paymentTransactionDataFactory.document({
          account: accountDocument,
          category: categoryDocument,
        });

        deferredTransactionDocument = deferredTransactionDataFactory.document({
          account: accountDocument,
          category: categoryDocument,
          loanAccount: loanAccountDocument,
        });

        reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
          account: loanAccountDocument,
          category: categoryDocument,
          loanAccount: accountDocument,
        });

        splitTransactionDocument = splitTransactionDataFactory.document({
          account: accountDocument,
          splits: [
            {
              category: categoryDocument,
            },
            {
              category: unrelatedCategoryDocument,
            },
          ],
          loans: [
            {
              category: categoryDocument,
              loanAccount: loanAccountDocument,
            },
            {
              category: unrelatedCategoryDocument,
              loanAccount: loanAccountDocument,
            },
          ],
        });

        cy.saveAccountDocuments([
          accountDocument,
          loanAccountDocument,
        ])
          .saveCategoryDocuments([
            categoryDocument,
            unrelatedCategoryDocument,
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
          .requestDeleteCategory(getCategoryId(categoryDocument))
          .expectNoContentResponse()
          .validateCategoryDeleted(getCategoryId(categoryDocument))
          .validateRelatedChangesInPaymentDocument(paymentTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInPaymentDocument(unrelatedPaymentTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInDeferredDocument(deferredTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInDeferredDocument(unrelatedDeferredTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInReimbursementDocument(reimbursementTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInReimbursementDocument(unrelatedReimbursementTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          });
          .validateRelatedChangesInSplitDocument(splitTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          });
      });

      it('inventory should be unset if category is deleted', () => {
        categoryDocument = categoryDataFactory.document({
          body: {
            categoryType: CategoryType.Inventory,
          },
        });

        const productDocument = productDataFactory.document({
          category: categoryDocument,
        });

        unrelatedCategoryDocument = categoryDataFactory.document({
          body: {
            categoryType: CategoryType.Inventory,
          },
        });

        const unrelatedProductDocument = productDataFactory.document({
          category: unrelatedCategoryDocument,
        });

        unrelatedPaymentTransactionDocument = paymentTransactionDataFactory.document({
          account: accountDocument,
          category: unrelatedCategoryDocument,
          product: unrelatedProductDocument,
        });

        unrelatedDeferredTransactionDocument = deferredTransactionDataFactory.document({
          account: accountDocument,
          category: unrelatedCategoryDocument,
          product: unrelatedProductDocument,
          loanAccount: loanAccountDocument,
        });

        unrelatedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
          account: loanAccountDocument,
          category: unrelatedCategoryDocument,
          product: unrelatedProductDocument,
          loanAccount: accountDocument,
        });

        paymentTransactionDocument = paymentTransactionDataFactory.document({
          account: accountDocument,
          category: categoryDocument,
          product: productDocument,
        });

        deferredTransactionDocument = deferredTransactionDataFactory.document({
          account: accountDocument,
          category: categoryDocument,
          loanAccount: loanAccountDocument,
          product: productDocument,
        });

        reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
          account: loanAccountDocument,
          category: categoryDocument,
          loanAccount: accountDocument,
          product: productDocument,
        });

        splitTransactionDocument = splitTransactionDataFactory.document({
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

        cy.saveAccountDocuments([
          accountDocument,
          loanAccountDocument,
        ])
          .saveCategoryDocuments([
            categoryDocument,
            unrelatedCategoryDocument,
          ])
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
          .requestDeleteCategory(getCategoryId(categoryDocument))
          .expectNoContentResponse()
          .validateCategoryDeleted(getCategoryId(categoryDocument))
          .validateRelatedChangesInPaymentDocument(paymentTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInPaymentDocument(unrelatedPaymentTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInDeferredDocument(deferredTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInDeferredDocument(unrelatedDeferredTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInReimbursementDocument(reimbursementTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInReimbursementDocument(unrelatedReimbursementTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInSplitDocument(splitTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          });
      });

      it('invoice should be unset if category is deleted', () => {
        categoryDocument = categoryDataFactory.document({
          body: {
            categoryType: CategoryType.Invoice,
          },
        });

        unrelatedCategoryDocument = categoryDataFactory.document({
          body: {
            categoryType: CategoryType.Invoice,
          },
        });

        unrelatedPaymentTransactionDocument = paymentTransactionDataFactory.document({
          account: accountDocument,
          category: unrelatedCategoryDocument,
        });

        unrelatedDeferredTransactionDocument = deferredTransactionDataFactory.document({
          account: accountDocument,
          category: unrelatedCategoryDocument,
          loanAccount: loanAccountDocument,
        });

        unrelatedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
          account: loanAccountDocument,
          category: unrelatedCategoryDocument,
          loanAccount: accountDocument,
        });

        paymentTransactionDocument = paymentTransactionDataFactory.document({
          account: accountDocument,
          category: categoryDocument,
        });

        deferredTransactionDocument = deferredTransactionDataFactory.document({
          account: accountDocument,
          category: categoryDocument,
          loanAccount: loanAccountDocument,
        });

        reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
          account: loanAccountDocument,
          category: categoryDocument,
          loanAccount: accountDocument,
        });

        splitTransactionDocument = splitTransactionDataFactory.document({
          account: accountDocument,
          splits: [
            {
              category: categoryDocument,
            },
            {
              category: unrelatedCategoryDocument,
            },
          ],
          loans: [
            {
              category: categoryDocument,
              loanAccount: loanAccountDocument,
            },
            {
              category: unrelatedCategoryDocument,
              loanAccount: loanAccountDocument,
            },
          ],
        });

        cy.saveAccountDocuments([
          accountDocument,
          loanAccountDocument,
        ])
          .saveCategoryDocuments([
            categoryDocument,
            unrelatedCategoryDocument,
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
          .requestDeleteCategory(getCategoryId(categoryDocument))
          .expectNoContentResponse()
          .validateCategoryDeleted(getCategoryId(categoryDocument))
          .validateRelatedChangesInPaymentDocument(paymentTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInPaymentDocument(unrelatedPaymentTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInDeferredDocument(deferredTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInDeferredDocument(unrelatedDeferredTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInReimbursementDocument(reimbursementTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInReimbursementDocument(unrelatedReimbursementTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          })
          .validateRelatedChangesInSplitDocument(splitTransactionDocument, {
            category: {
              from: categoryDocument,
            },
          });
      });
    });

    describe('related products', () => {
      it('should be deleted', () => {
        categoryDocument = categoryDataFactory.document({
          body: {
            categoryType: CategoryType.Inventory,
          },
        });
        const productDocument = productDataFactory.document({
          category: categoryDocument,
        });

        cy.saveCategoryDocument(categoryDocument)
          .saveProductDocument(productDocument)
          .authenticate(1)
          .requestDeleteCategory(getCategoryId(categoryDocument))
          .expectNoContentResponse()
          .validateCategoryDeleted(getCategoryId(categoryDocument))
          .validateProductDeleted(getProductId(productDocument));
      });
    });

    describe('should return error', () => {
      describe('if categoryId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestDeleteCategory(createCategoryId('not-valid'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('categoryId', 'pathParameters');
        });
      });
    });
  });
});
