import { Account, Category, Product, Project, Recipient, Transaction } from '@household/shared/types/types';
import { entries, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { default as schema } from '@household/test/schemas/transaction-report-list';
import { createAccountId } from '@household/shared/common/test-data-factory';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { isDeferredTransaction } from '@household/shared/common/type-guards';
import { AccountType, CategoryType } from '@household/shared/enums';
import { forbidUsers } from '@household/test/utils';

import { test, expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { accountService, categoryService, productService, projectService, recipientService, transactionService } from '@household/test/dependencies';

const expect = mergeExpects(transactionApiExpect, apiExpect);

const permissionMap = forbidUsers();

const splitTransactionHelper = (doc: Transaction.SplitDocument, split: Transaction.SplitDocumentItem | Transaction.DeferredDocument):(Transaction.SplitDocument & {split?: Transaction.SplitDocumentItem; deferredSplit?: Transaction.DeferredDocument}) => {
  return {
    ...doc,
    split: isDeferredTransaction(split) ? undefined : split,
    deferredSplit: isDeferredTransaction(split) ? split : undefined,
  };
};

test.describe('POST /transaction/v1/transactionReports', () => {
  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestGetTransactionReports }) => {
      const res = await requestGetTransactionReports([]);
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
        test('should return forbidden', async ({ requestGetTransactionReports }) => {
          const res = await requestGetTransactionReports([]);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should get a list of transaction reports', () => {
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
          let loanTransferTransactionDocument: Transaction.TransferDocument;

          test.beforeEach(async () => {
            accountDocument = accountDataFactory.document();
            secondaryAccountDocument = accountDataFactory.document();
            loanAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });

            recipientDocument = recipientDataFactory.document();
            secondaryRecipientDocument = recipientDataFactory.document();

            projectDocument = projectDataFactory.document();
            secondaryProjectDocument = projectDataFactory.document();

            regularCategoryDocument = categoryDataFactory.document({
              body: {
                categoryType: CategoryType.Regular,
              },
            });

            invoiceCategoryDocument = categoryDataFactory.document({
              body: {
                categoryType: CategoryType.Invoice,
              },
            });

            inventoryCategoryDocument = categoryDataFactory.document({
              body: {
                categoryType: CategoryType.Inventory,
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

            loanTransferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: loanAccountDocument,
            });

            await recipientService.saveRecipients(recipientDocument, secondaryRecipientDocument);
            await accountService.saveAccounts(accountDocument, secondaryAccountDocument, loanAccountDocument);
            await categoryService.saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument, secondaryCategoryDocument);
            await projectService.saveProjects(projectDocument, secondaryProjectDocument);
            await productService.saveProducts(productDocument, secondaryProductDocument);
            await transactionService.saveTransactions(transferTransactionDocument, loanTransferTransactionDocument);
          });

          test.describe('filtered by account', () => {
            test.beforeEach(async () => {
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
                loans: [
                  {
                    loanAccount: accountDocument,
                  },
                ],
              });

              await transactionService.saveTransactions(includedPaymentTransactionDocument, splitTransactionDocument, includedDeferredTransactionDocument, includedReimbursementTransactionDocument, excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, deferredSplitTransactionDocument);
            });
            test('to include', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: [getAccountId(accountDocument)],
                  include: true, 
                }, 
              ]);
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ includedPaymentTransactionDocument, includedDeferredTransactionDocument, includedReimbursementTransactionDocument, splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[0]), splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[1]), splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[0]), ])
            });

            test('to exclude', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
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
              ]);
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, ])

            });
          });

          test.describe('filtered by recipient', () => {
            test.beforeEach(async () => {
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
                loans: [
                  {
                    loanAccount: secondaryAccountDocument,
                  },
                ],
              });

              await transactionService.saveTransactions(includedPaymentTransactionDocument, splitTransactionDocument, includedDeferredTransactionDocument, includedReimbursementTransactionDocument, excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, deferredSplitTransactionDocument);
            });
            test('to include', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'recipient',
                  items: [getRecipientId(recipientDocument)],
                  include: true, 
                }, 
              ]);
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ includedPaymentTransactionDocument, includedDeferredTransactionDocument, includedReimbursementTransactionDocument, splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[0]), splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[1]), splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[0]), ])
            });

            test('to exclude', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
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
              ]);
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, ])

            });
          });

          test.describe('filtered by project', () => {
            test.beforeEach(async () => {
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
                loans: [
                  {
                    loanAccount: accountDocument,
                    project: projectDocument,
                  },
                  {
                    loanAccount: accountDocument,
                  },
                ],
              });

              await transactionService.saveTransactions(includedPaymentTransactionDocument, splitTransactionDocument, includedDeferredTransactionDocument, includedReimbursementTransactionDocument, excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, deferredSplitTransactionDocument);
            });
            test('to include', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'project',
                  items: [getProjectId(projectDocument)],
                  include: true, 
                }, 
              ]);
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ includedPaymentTransactionDocument, includedDeferredTransactionDocument, includedReimbursementTransactionDocument, splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[0]), splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[0]), ])
            });

            test('to exclude', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
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
              ]);
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[1]), splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[1]), ])

            });
          });

          test.describe('filtered by category', () => {
            test.beforeEach(async () => {
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
                loans: [
                  {
                    loanAccount: accountDocument,
                    category: regularCategoryDocument,
                  },
                  {
                    loanAccount: accountDocument,
                  },
                ],
              });

              await transactionService.saveTransactions(includedPaymentTransactionDocument, splitTransactionDocument, includedDeferredTransactionDocument, includedReimbursementTransactionDocument, excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, deferredSplitTransactionDocument);
            });
            test('to include', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'category',
                  items: [
                    getCategoryId(regularCategoryDocument),
                    getCategoryId(inventoryCategoryDocument),
                    getCategoryId(invoiceCategoryDocument), 
                  ],
                  include: true, 
                }, 
              ]);
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ includedPaymentTransactionDocument, includedDeferredTransactionDocument, includedReimbursementTransactionDocument, splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[0]), splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[1]), splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[2]), splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[0]), ])
            });

            test('to exclude', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
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
              ]);
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[3]), splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[1]), ])

            });
          });

          test.describe('filtered by product', () => {
            test.beforeEach(async () => {
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
                loans: [
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

              await transactionService.saveTransactions(includedPaymentTransactionDocument, splitTransactionDocument, includedDeferredTransactionDocument, includedReimbursementTransactionDocument, excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, deferredSplitTransactionDocument);
            });
            test('to include', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'product',
                  items: [getProductId(productDocument)],
                  include: true, 
                }, 
              ]);
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ includedPaymentTransactionDocument, includedDeferredTransactionDocument, includedReimbursementTransactionDocument, splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[0]), splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[0]), ])
            });

            test('to exclude', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
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
              ]);
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[1]), splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[1]), ])

            });
          });

          test.describe('filtered by issuedAt', () => {
            test.beforeEach(async () => {
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
                loans: [
                  {
                    loanAccount: accountDocument,
                  },
                ],
              });

              await transactionService.saveTransactions(includedPaymentTransactionDocument, splitTransactionDocument, includedDeferredTransactionDocument, includedReimbursementTransactionDocument, excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, deferredSplitTransactionDocument);
            });
            test('to include a range', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
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
              ]);
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ includedPaymentTransactionDocument, includedDeferredTransactionDocument, includedReimbursementTransactionDocument, splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[0]), splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[1]), splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[0]), ])
            });

            test('to exclude a range', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
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
              ]);
              expect(res).toBeOkResponse();
              expect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, ])

            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('is not an array', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports({} as any);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'data', 'array');
            });

            test('does not have at least one item', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooFewItemsValidationError('body', 'data', 1);
            });
          });

          test.describe('if body[0]', () => {
            test('has additional properties', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: [createAccountId()],
                  include: true,
                  extra: 1, 
                } as any, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', '0', 'extra');
            });

            test('is missing both "from" and "to" properties', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'issuedAt',
                  from: undefined,
                  to: undefined,
                  include: true, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'from');
              expect(res).toHaveRequiredPropertyValidationError('body', 'to');
            });
          });

          test.describe('if body[0].include', () => {
            test('is missing', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: [createAccountId()],
                  include: undefined, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'include');
            });

            test('is not boolean', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: [createAccountId()],
                  include: 1 as any, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'include', 'boolean');
            });
          });

          test.describe('if body[0].filterType', () => {
            test('is missing', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: undefined,
                  items: [createAccountId()],
                  include: false, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'filterType');
            });
            test('is not string', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 1 as any,
                  items: [createAccountId()],
                  include: false, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'filterType', 'string');
            });
            test('is not a valid enum value', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'not filter type' as any,
                  items: [createAccountId()],
                  include: false, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveEnumValidationError('body', 'filterType');
            });
          });

          test.describe('if body[0].items', () => {
            test('is missing', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: undefined,
                  include: false, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'items');
            });
            test('is not an array', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: 1 as any,
                  include: false, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'items', 'array');
            });
            test('has less than 1 item', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: [],
                  include: false, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooFewItemsValidationError('body', 'items', 1);
            });
          });

          test.describe('if body[0].items[0]', () => {
            test('is not string', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: [1 as any],
                  include: false, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'items/0', 'string');
            });
            test('does not match pattern', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: ['not mongo id' as any],
                  include: false, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'items/0');
            });
          });

          test.describe('if body[0].from', () => {
            test('is not string', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'issuedAt',
                  include: false,
                  from: 1 as any,
                  to: undefined, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'from', 'string');
            });
            test('is not a date', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'issuedAt',
                  include: false,
                  from: 'not date',
                  to: undefined, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'from', 'date-time');
            });
          });

          test.describe('if body[0].to', () => {
            test('is not string', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'issuedAt',
                  include: false,
                  to: 1 as any,
                  from: undefined, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'to', 'string');
            });
            test('is not a date', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'issuedAt',
                  include: false,
                  to: 'not date',
                  from: undefined, 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongFormatValidationError('body', 'to', 'date-time');
            });

            test('is earlier than "from"', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'issuedAt',
                  include: false,
                  to: new Date(2024, 3, 4, 12, 0, 0).toISOString(),
                  from: new Date(2024, 4, 4, 12, 0, 0).toISOString(), 
                }, 
              ]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooEarlyDateValidationError('body', 'to', true);
            });
          });
        });
      }
    });
  });
});
