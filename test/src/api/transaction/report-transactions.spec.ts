import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { default as schema } from '@household/test/api/schemas/transaction-report-list';
import { createAccountId } from '@household/shared/common/test-data-factory';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer-data-factory';
import { loanTransferTransactionDataFactory } from '@household/test/api/transaction/loan-transfer-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement-data-factory';
import { isDeferredTransaction } from '@household/shared/common/type-guards';

const splitTransactionHelper = (doc: Transaction.SplitDocument, split: Transaction.SplitDocumentItem | Transaction.DeferredDocument):(Transaction.SplitDocument & {split?: Transaction.SplitDocumentItem; deferredSplit?: Transaction.DeferredDocument}) => {
  return {
    ...doc,
    split: isDeferredTransaction(split) ? undefined : split,
    deferredSplit: isDeferredTransaction(split) ? split : undefined,
  };
};

describe('POST /transaction/v1/transactionReports', () => {
  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetTransactionReports([])
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    describe('should get a list of transaction reports', () => {
      let accountDocument: Account.Document;
      let secondaryAccountDocument: Account.Document;
      let loanAccountDocument: Account.Document;
      let projectDocument: Project.Document;
      let secondaryProjectDocument: Project.Document;
      let recipientDocument: Recipient.Document;
      let secondaryRecipientDocument: Recipient.Document;
      let regularCategoryDocument: Category.Document;
      let inventoryCategoryDocument: Category.Document;
      let invoiceCategoryDocument: Category.Document;
      let secondaryCategoryDocument: Category.Document;
      let productDocument: Product.Document;
      let secondaryProductDocument: Product.Document;

      let splitTransactionDocument: Transaction.SplitDocument;
      let includedPaymentTransactionDocument: Transaction.PaymentDocument;
      let includedDeferredTransactionDocument: Transaction.DeferredDocument;
      let includedReimbursementTransactionDocument: Transaction.ReimbursementDocument;
      let excludedPaymentTransactionDocument: Transaction.PaymentDocument;
      let excludedDeferredTransactionDocument: Transaction.DeferredDocument;
      let excludedReimbursementTransactionDocument: Transaction.ReimbursementDocument;
      let deferredSplitTransactionDocument: Transaction.SplitDocument;
      let transferTransactionDocument: Transaction.TransferDocument;
      let loanTransferTransactionDocument: Transaction.LoanTransferDocument;

      beforeEach(() => {
        accountDocument = accountDataFactory.document();
        secondaryAccountDocument = accountDataFactory.document();
        loanAccountDocument = accountDataFactory.document({
          accountType: 'loan',
        });

        recipientDocument = recipientDataFactory.document();
        secondaryRecipientDocument = recipientDataFactory.document();

        projectDocument = projectDataFactory.document();
        secondaryProjectDocument = projectDataFactory.document();

        regularCategoryDocument = categoryDataFactory.document({
          body: {
            categoryType: 'regular',
          },
        });

        invoiceCategoryDocument = categoryDataFactory.document({
          body: {
            categoryType: 'invoice',
          },
        });

        inventoryCategoryDocument = categoryDataFactory.document({
          body: {
            categoryType: 'inventory',
          },
        });

        secondaryCategoryDocument = categoryDataFactory.document();

        productDocument = productDataFactory.document({
          category: inventoryCategoryDocument,
        });
        secondaryProductDocument = productDataFactory.document({
          category: inventoryCategoryDocument,
        });

        transferTransactionDocument = transferTransactionDataFactory.document({
          account: accountDocument,
          transferAccount: secondaryAccountDocument,
        });

        loanTransferTransactionDocument = loanTransferTransactionDataFactory.document({
          account: accountDocument,
          transferAccount: loanAccountDocument,
        });

        cy.saveRecipientDocuments([
          recipientDocument,
          secondaryRecipientDocument,
        ])
          .saveAccountDocuments([
            accountDocument,
            secondaryAccountDocument,
            loanAccountDocument,
          ])
          .saveCategoryDocuments([
            regularCategoryDocument,
            invoiceCategoryDocument,
            inventoryCategoryDocument,
            secondaryCategoryDocument,
          ])
          .saveProjectDocuments([
            projectDocument,
            secondaryProjectDocument,
          ])
          .saveProductDocuments([
            productDocument,
            secondaryProductDocument,
          ])
          .saveTransactionDocuments([
            transferTransactionDocument,
            loanTransferTransactionDocument,
          ]);
      });

      describe('filtered by account', () => {
        beforeEach(() => {
          includedPaymentTransactionDocument = paymentTransactionDataFactory.document({
            account: accountDocument,
            recipient: recipientDocument,
          });

          splitTransactionDocument = splitTransactionDataFactory.document({
            account: accountDocument,
            recipient: recipientDocument,
            splits: [
              {},
              {},
            ],
          });

          includedDeferredTransactionDocument = deferredTransactionDataFactory.document({
            loanAccount: accountDocument,
            account: secondaryAccountDocument,
            recipient: recipientDocument,
          });

          includedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
            account: loanAccountDocument,
            loanAccount: accountDocument,
            recipient: recipientDocument,
          });

          excludedPaymentTransactionDocument = paymentTransactionDataFactory.document({
            account: secondaryAccountDocument,
            recipient: recipientDocument,
          });

          excludedDeferredTransactionDocument = deferredTransactionDataFactory.document({
            loanAccount: secondaryAccountDocument,
            account: accountDocument,
            recipient: recipientDocument,
          });

          excludedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
            account: loanAccountDocument,
            loanAccount: secondaryAccountDocument,
            recipient: recipientDocument,
          });

          deferredSplitTransactionDocument = splitTransactionDataFactory.document({
            account: secondaryAccountDocument,
            recipient: recipientDocument,
            splits: [
              {},
              {
                loanAccount: accountDocument,
              },
            ],
          });

          cy.saveTransactionDocuments([
            includedPaymentTransactionDocument,
            splitTransactionDocument,
            includedDeferredTransactionDocument,
            includedReimbursementTransactionDocument,
            excludedPaymentTransactionDocument,
            excludedDeferredTransactionDocument,
            excludedReimbursementTransactionDocument,
            deferredSplitTransactionDocument,
          ]);
        });
        it('to include', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: [getAccountId(accountDocument)],
                include: true,
              },
            ])
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateTransactionListReport([
              includedPaymentTransactionDocument,
              includedDeferredTransactionDocument,
              includedReimbursementTransactionDocument,
              splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[0]),
              splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[1]),
              splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[0]),
            ]);
        });

        it('to exclude', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'recipient',
                items: [getRecipientId(recipientDocument)],
                include: true,
              },
              {
                filterType: 'account',
                items: [getAccountId(accountDocument)],
                include: false,
              },
            ])
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateTransactionListReport([
              excludedPaymentTransactionDocument,
              excludedDeferredTransactionDocument,
              excludedReimbursementTransactionDocument,
              splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.splits[0]),
            ]);

        });
      });

      describe('filtered by recipient', () => {
        beforeEach(() => {
          includedPaymentTransactionDocument = paymentTransactionDataFactory.document({
            account: accountDocument,
            recipient: recipientDocument,
          });

          splitTransactionDocument = splitTransactionDataFactory.document({
            account: accountDocument,
            recipient: recipientDocument,
            splits: [
              {},
              {},
            ],
          });

          includedDeferredTransactionDocument = deferredTransactionDataFactory.document({
            loanAccount: accountDocument,
            account: secondaryAccountDocument,
            recipient: recipientDocument,
          });

          includedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
            account: loanAccountDocument,
            loanAccount: accountDocument,
            recipient: recipientDocument,
          });

          excludedPaymentTransactionDocument = paymentTransactionDataFactory.document({
            account: accountDocument,
            recipient: secondaryRecipientDocument,
          });

          excludedDeferredTransactionDocument = deferredTransactionDataFactory.document({
            loanAccount: accountDocument,
            account: secondaryAccountDocument,
            recipient: secondaryRecipientDocument,
          });

          excludedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
            account: loanAccountDocument,
            loanAccount: accountDocument,
            recipient: secondaryRecipientDocument,
          });

          deferredSplitTransactionDocument = splitTransactionDataFactory.document({
            account: accountDocument,
            recipient: recipientDocument,
            splits: [
              {
                loanAccount: secondaryAccountDocument,
              },
            ],
          });

          cy.saveTransactionDocuments([
            includedPaymentTransactionDocument,
            splitTransactionDocument,
            includedDeferredTransactionDocument,
            includedReimbursementTransactionDocument,
            excludedPaymentTransactionDocument,
            excludedDeferredTransactionDocument,
            excludedReimbursementTransactionDocument,
            deferredSplitTransactionDocument,
          ]);
        });
        it('to include', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'recipient',
                items: [getRecipientId(recipientDocument)],
                include: true,
              },
            ])
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateTransactionListReport([
              includedPaymentTransactionDocument,
              includedDeferredTransactionDocument,
              includedReimbursementTransactionDocument,
              splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[0]),
              splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[1]),
              splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[0]),
            ]);
        });

        it('to exclude', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: [getAccountId(accountDocument)],
                include: true,
              },
              {
                filterType: 'recipient',
                items: [getRecipientId(recipientDocument)],
                include: false,
              },
            ])
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateTransactionListReport([
              excludedPaymentTransactionDocument,
              excludedDeferredTransactionDocument,
              excludedReimbursementTransactionDocument,
            ]);

        });
      });

      describe('filtered by project', () => {
        beforeEach(() => {
          includedPaymentTransactionDocument = paymentTransactionDataFactory.document({
            account: accountDocument,
            project: projectDocument,
          });

          splitTransactionDocument = splitTransactionDataFactory.document({
            account: accountDocument,
            splits: [
              {
                project: projectDocument,
              },
              {},
            ],
          });

          includedDeferredTransactionDocument = deferredTransactionDataFactory.document({
            loanAccount: accountDocument,
            account: secondaryAccountDocument,
            project: projectDocument,
          });

          includedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
            account: loanAccountDocument,
            loanAccount: accountDocument,
            project: projectDocument,
          });

          excludedPaymentTransactionDocument = paymentTransactionDataFactory.document({
            account: accountDocument,
            project: secondaryProjectDocument,
          });

          excludedDeferredTransactionDocument = deferredTransactionDataFactory.document({
            loanAccount: accountDocument,
            account: secondaryAccountDocument,
            project: secondaryProjectDocument,
          });

          excludedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
            account: loanAccountDocument,
            loanAccount: accountDocument,
            project: secondaryProjectDocument,
          });

          deferredSplitTransactionDocument = splitTransactionDataFactory.document({
            account: secondaryAccountDocument,
            splits: [
              {
                loanAccount: accountDocument,
                project: projectDocument,
              },
              {
                loanAccount: accountDocument,
              },
            ],
          });

          cy.saveTransactionDocuments([
            includedPaymentTransactionDocument,
            splitTransactionDocument,
            includedDeferredTransactionDocument,
            includedReimbursementTransactionDocument,
            excludedPaymentTransactionDocument,
            excludedDeferredTransactionDocument,
            excludedReimbursementTransactionDocument,
            deferredSplitTransactionDocument,
          ]);
        });
        it('to include', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'project',
                items: [getProjectId(projectDocument)],
                include: true,
              },
            ])
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateTransactionListReport([
              includedPaymentTransactionDocument,
              includedDeferredTransactionDocument,
              includedReimbursementTransactionDocument,
              splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[0]),
              splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[0]),
            ]);
        });

        it('to exclude', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: [getAccountId(accountDocument)],
                include: true,
              },
              {
                filterType: 'project',
                items: [getProjectId(projectDocument)],
                include: false,
              },
            ])
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateTransactionListReport([
              excludedPaymentTransactionDocument,
              excludedDeferredTransactionDocument,
              excludedReimbursementTransactionDocument,
              splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[1]),
              splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[1]),
            ]);

        });
      });

      describe('filtered by category', () => {
        beforeEach(() => {
          includedPaymentTransactionDocument = paymentTransactionDataFactory.document({
            account: accountDocument,
            category: regularCategoryDocument,
          });

          splitTransactionDocument = splitTransactionDataFactory.document({
            account: accountDocument,
            splits: [
              {
                category: inventoryCategoryDocument,
              },
              {
                category: regularCategoryDocument,
              },
              {
                category: invoiceCategoryDocument,
              },
              {},
            ],
          });

          includedDeferredTransactionDocument = deferredTransactionDataFactory.document({
            loanAccount: accountDocument,
            account: secondaryAccountDocument,
            category: invoiceCategoryDocument,
          });

          includedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
            account: loanAccountDocument,
            loanAccount: accountDocument,
            category: regularCategoryDocument,
          });

          excludedPaymentTransactionDocument = paymentTransactionDataFactory.document({
            account: accountDocument,
            category: secondaryCategoryDocument,
          });

          excludedDeferredTransactionDocument = deferredTransactionDataFactory.document({
            loanAccount: accountDocument,
            account: secondaryAccountDocument,
            category: secondaryCategoryDocument,
          });

          excludedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
            account: loanAccountDocument,
            loanAccount: accountDocument,
            category: secondaryCategoryDocument,
          });

          deferredSplitTransactionDocument = splitTransactionDataFactory.document({
            account: secondaryAccountDocument,
            splits: [
              {
                loanAccount: accountDocument,
                category: regularCategoryDocument,
              },
              {
                loanAccount: accountDocument,
              },
            ],
          });

          cy.saveTransactionDocuments([
            includedPaymentTransactionDocument,
            splitTransactionDocument,
            includedDeferredTransactionDocument,
            includedReimbursementTransactionDocument,
            excludedPaymentTransactionDocument,
            excludedDeferredTransactionDocument,
            excludedReimbursementTransactionDocument,
            deferredSplitTransactionDocument,
          ]);
        });
        it('to include', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'category',
                items: [
                  getCategoryId(regularCategoryDocument),
                  getCategoryId(inventoryCategoryDocument),
                  getCategoryId(invoiceCategoryDocument),
                ],
                include: true,
              },
            ])
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateTransactionListReport([
              includedPaymentTransactionDocument,
              includedDeferredTransactionDocument,
              includedReimbursementTransactionDocument,
              splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[0]),
              splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[1]),
              splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[2]),
              splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[0]),
            ]);
        });

        it('to exclude', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: [getAccountId(accountDocument)],
                include: true,
              },
              {
                filterType: 'category',
                items: [
                  getCategoryId(regularCategoryDocument),
                  getCategoryId(inventoryCategoryDocument),
                  getCategoryId(invoiceCategoryDocument),
                ],
                include: false,
              },
            ])
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateTransactionListReport([
              excludedPaymentTransactionDocument,
              excludedDeferredTransactionDocument,
              excludedReimbursementTransactionDocument,
              splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[3]),
              splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[1]),
            ]);

        });
      });

      describe('filtered by product', () => {
        beforeEach(() => {
          includedPaymentTransactionDocument = paymentTransactionDataFactory.document({
            account: accountDocument,
            category: inventoryCategoryDocument,
            product: productDocument,
          });

          splitTransactionDocument = splitTransactionDataFactory.document({
            account: accountDocument,
            splits: [
              {
                category: inventoryCategoryDocument,
                product: productDocument,
              },
              {},
            ],
          });

          includedDeferredTransactionDocument = deferredTransactionDataFactory.document({
            loanAccount: accountDocument,
            account: secondaryAccountDocument,
            category: inventoryCategoryDocument,
            product: productDocument,
          });

          includedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
            account: loanAccountDocument,
            loanAccount: accountDocument,
            category: inventoryCategoryDocument,
            product: productDocument,
          });

          excludedPaymentTransactionDocument = paymentTransactionDataFactory.document({
            account: accountDocument,
            category: inventoryCategoryDocument,
            product: secondaryProductDocument,
          });

          excludedDeferredTransactionDocument = deferredTransactionDataFactory.document({
            loanAccount: accountDocument,
            account: secondaryAccountDocument,
            category: inventoryCategoryDocument,
            product: secondaryProductDocument,
          });

          excludedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
            account: loanAccountDocument,
            loanAccount: accountDocument,
            category: inventoryCategoryDocument,
            product: secondaryProductDocument,
          });

          deferredSplitTransactionDocument = splitTransactionDataFactory.document({
            account: secondaryAccountDocument,
            splits: [
              {
                loanAccount: accountDocument,
                category: inventoryCategoryDocument,
                product: productDocument,
              },
              {
                loanAccount: accountDocument,
                category: inventoryCategoryDocument,
                product: secondaryProductDocument,
              },
            ],
          });

          cy.saveTransactionDocuments([
            includedPaymentTransactionDocument,
            splitTransactionDocument,
            includedDeferredTransactionDocument,
            includedReimbursementTransactionDocument,
            excludedPaymentTransactionDocument,
            excludedDeferredTransactionDocument,
            excludedReimbursementTransactionDocument,
            deferredSplitTransactionDocument,
          ]);
        });
        it('to include', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'product',
                items: [getProductId(productDocument)],
                include: true,
              },
            ])
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateTransactionListReport([
              includedPaymentTransactionDocument,
              includedDeferredTransactionDocument,
              includedReimbursementTransactionDocument,
              splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[0]),
              splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[0]),
            ]);
        });

        it('to exclude', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: [getAccountId(accountDocument)],
                include: true,
              },
              {
                filterType: 'product',
                items: [getProductId(productDocument)],
                include: false,
              },
            ])
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateTransactionListReport([
              excludedPaymentTransactionDocument,
              excludedDeferredTransactionDocument,
              excludedReimbursementTransactionDocument,
              splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[1]),
              splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[1]),
            ]);

        });
      });

      describe('filtered by issuedAt', () => {
        beforeEach(() => {
          includedPaymentTransactionDocument = paymentTransactionDataFactory.document({
            body: {
              issuedAt: new Date(2024, 7, 5, 12, 0, 0).toISOString(),
            },
            account: accountDocument,
          });

          splitTransactionDocument = splitTransactionDataFactory.document({
            body: {
              issuedAt: new Date(2024, 7, 5, 13, 0, 0).toISOString(),
            },
            account: accountDocument,
            splits: [
              {},
              {},
            ],
          });

          includedDeferredTransactionDocument = deferredTransactionDataFactory.document({
            body: {
              issuedAt: new Date(2024, 7, 5, 12, 20, 0).toISOString(),
            },
            loanAccount: accountDocument,
            account: secondaryAccountDocument,
          });

          includedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
            body: {
              issuedAt: new Date(2024, 7, 5, 22, 0, 0).toISOString(),
            },
            account: loanAccountDocument,
            loanAccount: accountDocument,
          });

          excludedPaymentTransactionDocument = paymentTransactionDataFactory.document({
            body: {
              issuedAt: new Date(2024, 7, 4, 12, 0, 0).toISOString(),
            },
            account: accountDocument,
          });

          excludedDeferredTransactionDocument = deferredTransactionDataFactory.document({
            body: {
              issuedAt: new Date(2024, 7, 3, 12, 0, 0).toISOString(),
            },
            loanAccount: accountDocument,
            account: secondaryAccountDocument,
          });

          excludedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
            body: {
              issuedAt: new Date(2024, 7, 6, 12, 0, 0).toISOString(),
            },
            account: loanAccountDocument,
            loanAccount: accountDocument,
          });

          deferredSplitTransactionDocument = splitTransactionDataFactory.document({
            body: {
              issuedAt: new Date(2024, 7, 5, 2, 0, 0).toISOString(),
            },
            account: secondaryAccountDocument,
            splits: [
              {
                loanAccount: accountDocument,
              },
            ],
          });

          cy.saveTransactionDocuments([
            includedPaymentTransactionDocument,
            splitTransactionDocument,
            includedDeferredTransactionDocument,
            includedReimbursementTransactionDocument,
            excludedPaymentTransactionDocument,
            excludedDeferredTransactionDocument,
            excludedReimbursementTransactionDocument,
            deferredSplitTransactionDocument,
          ]);
        });
        it('to include a range', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: [getAccountId(accountDocument)],
                include: true,
              },
              {
                filterType: 'issuedAt',
                from: new Date(2024, 7, 5, 0, 0, 0).toISOString(),
                to: new Date(2024, 7, 6, 0, 0, 0).toISOString(),
                include: true,
              },
            ])
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateTransactionListReport([
              includedPaymentTransactionDocument,
              includedDeferredTransactionDocument,
              includedReimbursementTransactionDocument,
              splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[0]),
              splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[1]),
              splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[0]),
            ]);
        });

        it('to exclude a range', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: [getAccountId(accountDocument)],
                include: true,
              },
              {
                filterType: 'issuedAt',
                from: new Date(2024, 7, 5, 0, 0, 0).toISOString(),
                to: new Date(2024, 7, 6, 0, 0, 0).toISOString(),
                include: false,
              },
            ])
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateTransactionListReport([
              excludedPaymentTransactionDocument,
              excludedDeferredTransactionDocument,
              excludedReimbursementTransactionDocument,
            ]);

        });
      });
    });

    describe('should return error', () => {
      describe('if body', () => {
        it('is not an array', () => {
          cy.authenticate(1)
            .requestGetTransactionReports({} as any)
            .expectBadRequestResponse()
            .expectWrongPropertyType('data', 'array', 'body');
        });

        it('does not have at least one item', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([])
            .expectBadRequestResponse()
            .expectTooFewItemsProperty('data', 1, 'body');
        });
      });

      describe('if body[0]', () => {
        it('has additional properties', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: [createAccountId()],
                include: true,
                extra: 1,
              } as any,
            ])
            .expectBadRequestResponse()
            .expectAdditionalProperty('data', 'body');
        });

        it('is missing both "from" and "to" properties', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'issuedAt',
                from: undefined,
                to: undefined,
                include: true,
              },
            ])
            .expectBadRequestResponse()
            .expectRequiredProperty('from', 'body')
            .expectRequiredProperty('to', 'body');
        });
      });

      describe('if body[0].include', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: [createAccountId()],
                include: undefined,
              },
            ])
            .expectBadRequestResponse()
            .expectRequiredProperty('include', 'body');
        });

        it('is not boolean', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: [createAccountId()],
                include: 1 as any,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyType ('include', 'boolean', 'body');
        });
      });

      describe('if body[0].filterType', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: undefined,
                items: [createAccountId()],
                include: false,
              },
            ])
            .expectBadRequestResponse()
            .expectRequiredProperty ('filterType', 'body');
        });
        it('is not string', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 1 as any,
                items: [createAccountId()],
                include: false,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyType ('filterType', 'string', 'body');
        });
        it('is not a valid enum value', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'not filter type' as any,
                items: [createAccountId()],
                include: false,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongEnumValue ('filterType', 'body');
        });
      });

      describe('if body[0].items', () => {
        it('is missing', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: undefined,
                include: false,
              },
            ])
            .expectBadRequestResponse()
            .expectRequiredProperty ('items', 'body');
        });
        it('is not an array', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: 1 as any,
                include: false,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyType ('items', 'array', 'body');
        });
        it('has less than 1 item', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: [],
                include: false,
              },
            ])
            .expectBadRequestResponse()
            .expectTooFewItemsProperty ('items', 1, 'body');
        });
      });

      describe('if body[0].items[0]', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: [1 as any],
                include: false,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyType('items/0', 'string', 'body');
        });
        it('does not match pattern', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'account',
                items: ['not mongo id' as any],
                include: false,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('items/0', 'body');
        });
      });

      describe('if body[0].from', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'issuedAt',
                include: false,
                from: 1 as any,
                to: undefined,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyType('from', 'string', 'body');
        });
        it('is not a date', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'issuedAt',
                include: false,
                from: 'not date',
                to: undefined,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('from', 'date-time', 'body');
        });
      });

      describe('if body[0].to', () => {
        it('is not string', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'issuedAt',
                include: false,
                to: 1 as any,
                from: undefined,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyType('to', 'string', 'body');
        });
        it('is not a date', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'issuedAt',
                include: false,
                to: 'not date',
                from: undefined,
              },
            ])
            .expectBadRequestResponse()
            .expectWrongPropertyFormat('to', 'date-time', 'body');
        });

        it('is earlier than "from"', () => {
          cy.authenticate(1)
            .requestGetTransactionReports([
              {
                filterType: 'issuedAt',
                include: false,
                to: new Date(2024, 3, 4, 12, 0, 0).toISOString(),
                from: new Date(2024, 4, 4, 12, 0, 0).toISOString(),
              },
            ])
            .expectBadRequestResponse()
            .expectTooEarlyDateProperty('to', 'body');
        });
      });
    });
  });
});
