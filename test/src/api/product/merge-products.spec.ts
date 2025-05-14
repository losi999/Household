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

describe('POST product/v1/products/{productId}/merge', () => {
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

  beforeEach(() => {
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

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestMergeProducts(productDataFactory.id(), [productDataFactory.id()])
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should merge products', () => {
      cy.saveAccountDocuments([
        accountDocument,
        loanAccountDocument,
      ])
        .saveCategoryDocument(categoryDocument)
        .saveProductDocuments([
          sourceProductDocument,
          targetProductDocument,
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
        .authenticate('admin')
        .requestMergeProducts(getProductId(targetProductDocument), [getProductId(sourceProductDocument)])
        .expectCreatedResponse()
        .validateProductDeleted(getProductId(sourceProductDocument))
        .validateRelatedChangesInPaymentDocument(paymentTransactionDocument, {
          product: {
            from: getProductId(sourceProductDocument),
            to: getProductId(targetProductDocument),
          },
        })
        .validateRelatedChangesInPaymentDocument(unrelatedPaymentTransactionDocument, {
          product: {
            from: getProductId(sourceProductDocument),
            to: getProductId(targetProductDocument),
          },
        })
        .validateRelatedChangesInDeferredDocument(deferredTransactionDocument, {
          product: {
            from: getProductId(sourceProductDocument),
            to: getProductId(targetProductDocument),
          },
        })
        .validateRelatedChangesInDeferredDocument(unrelatedDeferredTransactionDocument, {
          product: {
            from: getProductId(sourceProductDocument),
            to: getProductId(targetProductDocument),
          },
        })
        .validateRelatedChangesInReimbursementDocument(reimbursementTransactionDocument, {
          product: {
            from: getProductId(sourceProductDocument),
            to: getProductId(targetProductDocument),
          },
        })
        .validateRelatedChangesInReimbursementDocument(unrelatedReimbursementTransactionDocument, {
          product: {
            from: getProductId(sourceProductDocument),
            to: getProductId(targetProductDocument),
          },
        })
        .validateRelatedChangesInSplitDocument(splitTransactionDocument, {
          product: {
            from: getProductId(sourceProductDocument),
            to: getProductId(targetProductDocument),
          },
        });
    });

    describe('should return error', () => {

      it('if products do not belong to the same category', () => {
        const otherCategory = categoryDataFactory.document({
          body: {
            categoryType: CategoryType.Inventory,
          },
        });

        sourceProductDocument = productDataFactory.document({
          category: otherCategory,
        });

        cy.saveCategoryDocument(categoryDocument)
          .saveCategoryDocument(otherCategory)
          .saveProductDocument(targetProductDocument)
          .saveProductDocument(sourceProductDocument)
          .authenticate('admin')
          .requestMergeProducts(getProductId(targetProductDocument), [getProductId(sourceProductDocument)])
          .expectBadRequestResponse()
          .expectMessage('Not all products belong to the same category');
      });

      it('if a source product does not exist', () => {
        cy.saveCategoryDocument(categoryDocument)
          .saveProductDocument(targetProductDocument)
          .saveProductDocument(sourceProductDocument)
          .authenticate('admin')
          .requestMergeProducts(getProductId(targetProductDocument), [
            getProductId(sourceProductDocument),
            productDataFactory.id(),
          ])
          .expectBadRequestResponse()
          .expectMessage('Some of the products are not found');
      });

      describe('if body', () => {
        it('is not array', () => {
          cy.authenticate('admin')
            .requestMergeProducts(productDataFactory.id(), {} as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'array', 'body');
        });

        it('has too few items', () => {
          cy.authenticate('admin')
            .requestMergeProducts(productDataFactory.id(), [])
            .expectBadRequestResponse()
            .expectTooFewItemsProperty('data', 1, 'body');
        });
      });

      describe('if body[0]', () => {
        it('is not string', () => {
          cy.authenticate('admin')
            .requestMergeProducts(productDataFactory.id(), [1] as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'string', 'body');
        });

        it('is not a valid mongo id', () => {
          cy.authenticate('admin')
            .requestMergeProducts(productDataFactory.id(), [productDataFactory.id('not-valid')])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('data', 'body');
        });
      });

      describe('if productId', () => {
        it('is not a valid mongo id', () => {
          cy.authenticate('admin')
            .requestMergeProducts(productDataFactory.id('not-valid'), [productDataFactory.id()])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('productId', 'pathParameters');
        });

        it('does not belong to any product', () => {
          cy.authenticate('admin')
            .requestMergeProducts(productDataFactory.id(), [getProductId(sourceProductDocument)])
            .expectBadRequestResponse()
            .expectMessage('Some of the products are not found');
        });
      });
    });
  });
});
