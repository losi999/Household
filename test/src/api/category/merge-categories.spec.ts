import { getCategoryId } from '@household/shared/common/utils';
import { categoryTypes } from '@household/shared/constants';
import { Account, Category, Product, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split-data-factory';

describe('POST category/v1/categories/{categoryId}/merge', () => {
  let accountDocument: Account.Document;
  let sourceCategoryDocument: Category.Document;
  let targetCategoryDocument: Category.Document;

  beforeEach(() => {
    accountDocument = accountDataFactory.document();
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestMergeCategories(categoryDataFactory.id(), [categoryDataFactory.id()])
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should merge', () => {
      let loanAccountDocument: Account.Document;
      let unrelatedCategoryDocument: Category.Document;
      let productOfSourceCategoryDocument: Product.Document;
      let productOfTargetCategoryDocument: Product.Document;
      let unrelatedProductDocument: Product.Document;
      let paymentTransactionDocument: Transaction.PaymentDocument;
      let deferredTransactionDocument: Transaction.DeferredDocument;
      let reimbursementTransactionDocument: Transaction.ReimbursementDocument;
      let splitTransactionDocument: Transaction.SplitDocument;
      let unrelatedPaymentTransactionDocument: Transaction.PaymentDocument;
      let unrelatedDeferredTransactionDocument: Transaction.DeferredDocument;
      let unrelatedReimbursementTransactionDocument: Transaction.ReimbursementDocument;

      beforeEach(() => {
        loanAccountDocument = accountDataFactory.document({
          accountType: 'loan',
        });
      });

      categoryTypes.forEach((categoryType) => {
        it(`${categoryType} categories`, () => {
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

          unrelatedCategoryDocument = categoryDataFactory.document({
            body: {
              categoryType,
            },
          });

          if (categoryType === 'inventory') {
            productOfSourceCategoryDocument = productDataFactory.document({
              category: sourceCategoryDocument,
            });
            productOfTargetCategoryDocument = productDataFactory.document({
              category: targetCategoryDocument,
            });

            unrelatedProductDocument = productDataFactory.document({
              category: unrelatedCategoryDocument,
            });
          }

          paymentTransactionDocument = paymentTransactionDataFactory.document({
            account: accountDocument,
            category: sourceCategoryDocument,
            product: productOfSourceCategoryDocument,
          });

          deferredTransactionDocument = deferredTransactionDataFactory.document({
            account: accountDocument,
            category: sourceCategoryDocument,
            loanAccount: loanAccountDocument,
            product: productOfSourceCategoryDocument,
          });

          reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
            account: loanAccountDocument,
            category: sourceCategoryDocument,
            loanAccount: accountDocument,
            product: productOfSourceCategoryDocument,
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

          splitTransactionDocument = splitTransactionDataFactory.document({
            account: accountDocument,
            splits: [
              {
                category: sourceCategoryDocument,
                product: productOfSourceCategoryDocument,
              },
              {
                category: sourceCategoryDocument,
                product: productOfSourceCategoryDocument,
                loanAccount: loanAccountDocument,
              },
              {
                category: unrelatedCategoryDocument,
                product: unrelatedProductDocument,
              },
              {
                category: unrelatedCategoryDocument,
                loanAccount: loanAccountDocument,
                product: unrelatedProductDocument,
              },
            ],
          });

          let chain: Cypress.Chainable = cy.saveAccountDocuments([
            accountDocument,
            loanAccountDocument,
          ])
            .saveCategoryDocuments([
              sourceCategoryDocument,
              targetCategoryDocument,
              unrelatedCategoryDocument,
            ]);
          if (categoryType === 'inventory') {
            chain = chain.saveProductDocuments([
              productOfSourceCategoryDocument,
              productOfTargetCategoryDocument,
              unrelatedProductDocument,
            ]);
          }

          chain = chain.saveTransactionDocuments([
            paymentTransactionDocument,
            splitTransactionDocument,
            deferredTransactionDocument,
            reimbursementTransactionDocument,
            unrelatedPaymentTransactionDocument,
            unrelatedDeferredTransactionDocument,
            unrelatedReimbursementTransactionDocument,
          ])
            .authenticate(1)
            .requestMergeCategories(getCategoryId(targetCategoryDocument), [getCategoryId(sourceCategoryDocument)])
            .expectCreatedResponse()
            .validateCategoryDeleted(getCategoryId(sourceCategoryDocument));

          if (categoryType === 'inventory') {
            chain = chain.validateProductReassigned(productOfSourceCategoryDocument, getCategoryId(targetCategoryDocument));
          }
          chain.validateRelatedChangesInPaymentDocument(paymentTransactionDocument, {
            category: {
              from: sourceCategoryDocument,
              to: targetCategoryDocument,
            },
          })
            .validateRelatedChangesInPaymentDocument(unrelatedPaymentTransactionDocument, {
              category: {
                from: sourceCategoryDocument,
                to: targetCategoryDocument,
              },
            })
            .validateRelatedChangesInDeferredDocument(deferredTransactionDocument, {
              category: {
                from: sourceCategoryDocument,
                to: targetCategoryDocument,
              },
            })
            .validateRelatedChangesInDeferredDocument(unrelatedDeferredTransactionDocument, {
              category: {
                from: sourceCategoryDocument,
                to: targetCategoryDocument,
              },
            })
            .validateRelatedChangesInReimbursementDocument(reimbursementTransactionDocument, {
              category: {
                from: sourceCategoryDocument,
                to: targetCategoryDocument,
              },
            })
            .validateRelatedChangesInReimbursementDocument(unrelatedReimbursementTransactionDocument, {
              category: {
                from: sourceCategoryDocument,
                to: targetCategoryDocument,
              },
            })
            .validateRelatedChangesInSplitDocument(splitTransactionDocument, {
              category: {
                from: sourceCategoryDocument,
                to: targetCategoryDocument,
              },
            });
        });
      });
    });

    describe('should return error', () => {
      beforeEach(() => {
        sourceCategoryDocument = categoryDataFactory.document();
        targetCategoryDocument = categoryDataFactory.document({
          body: {
            categoryType: sourceCategoryDocument.categoryType,
          },
        });
      });
      it('if a source category does not exist', () => {
        cy.saveCategoryDocuments([
          sourceCategoryDocument,
          targetCategoryDocument,
        ])
          .authenticate(1)
          .requestMergeCategories(getCategoryId(targetCategoryDocument), [
            getCategoryId(sourceCategoryDocument),
            categoryDataFactory.id(),
          ])
          .expectBadRequestResponse()
          .expectMessage('Some of the categories are not found');
      });

      it('if a source category type is different than the others', () => {
        const otherTypeCategoryDocument = categoryDataFactory.document({
          body: {
            categoryType: sourceCategoryDocument.categoryType === 'regular' ? 'inventory' : 'regular',
          },
        });
        cy.saveCategoryDocuments([
          sourceCategoryDocument,
          targetCategoryDocument,
          otherTypeCategoryDocument,
        ])
          .authenticate(1)
          .requestMergeCategories(getCategoryId(targetCategoryDocument), [
            getCategoryId(sourceCategoryDocument),
            getCategoryId(otherTypeCategoryDocument),
          ])
          .expectBadRequestResponse()
          .expectMessage('All categories must be of same type');
      });

      describe('if body', () => {
        it('is not array', () => {
          cy.authenticate(1)
            .requestMergeCategories(categoryDataFactory.id(), {} as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'array', 'body');
        });

        it('has too few items', () => {
          cy.authenticate(1)
            .requestMergeCategories(categoryDataFactory.id(), [])
            .expectBadRequestResponse()
            .expectTooFewItemsProperty('data', 1, 'body');
        });
      });

      describe('if body[0]', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestMergeCategories(categoryDataFactory.id(), [1] as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'string', 'body');
        });

        it('is not a valid mongo id', () => {
          cy.authenticate(1)
            .requestMergeCategories(categoryDataFactory.id(), [categoryDataFactory.id('not-valid')])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('data', 'body');
        });
      });

      describe('is categoryId', () => {
        it('is not a valid mongo id', () => {
          cy.authenticate(1)
            .requestMergeCategories(categoryDataFactory.id('not-valid'), [categoryDataFactory.id()])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('categoryId', 'pathParameters');
        });

        it('does not belong to any category', () => {
          cy.authenticate(1)
            .requestMergeCategories(categoryDataFactory.id(), [getCategoryId(sourceCategoryDocument)])
            .expectBadRequestResponse()
            .expectMessage('Some of the categories are not found');
        });
      });
    });
  });
});
