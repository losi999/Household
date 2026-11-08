import { Documents } from '@household/shared/types/documents';
import { entries, getAccountId, getCategoryId, getProductId, getProjectId, getRecipientId } from '@household/shared/common/utils';
import { reportList as schema } from '@household/shared/schemas/transaction';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { projectDataFactory } from '@household/test/api/project/data-factory';
import { categoryDataFactory } from '@household/test/api/category/data-factory';
import { productDataFactory } from '@household/test/api/product/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { loanTransactionDataFactory } from '@household/test/api/transaction/loan/loan-data-factory';
import { AccountType, CategoryType } from '@household/shared/enums';
import { forbidUsers } from '@household/test/utils';

import { transactionApiTest, transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { mergeTests } from '@playwright/test';
import { accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { categoryDbTest } from '@household/test/fixtures/category-db.fixture';
import { projectDbTest } from '@household/test/fixtures/project-db.fixture';
import { recipientDbTest } from '@household/test/fixtures/recipient-db.fixture';
import { productDbTest } from '@household/test/fixtures/product-db.fixture';

const permissionMap = forbidUsers();

// const splitTransactionHelper = (doc: Documents.SplitTransaction, split: Documents.SplitItem | Documents.DeferredTransaction):(Documents.SplitTransaction & {split?: Documents.SplitItem; deferredSplit?: Documents.DeferredTransaction}) => {
//   return {
//     ...doc,
//     split: isDeferredTransaction(split) ? undefined : split,
//     deferredSplit: isDeferredTransaction(split) ? split : undefined,
//   };
// };

const test = mergeTests(transactionApiTest, accountDbTest, transactionDbTest, categoryDbTest, projectDbTest, recipientDbTest, productDbTest);

test.describe.skip('POST /transaction/v1/transactionReports', () => {
  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestGetTransactionReports }) => {
      const res = await requestGetTransactionReports([]);
      transactionApiExpect(res).toBeUnauthorizedResponse();
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
          transactionApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should get a list of transaction reports', () => {
          let accountDocument: Documents.Account;
          let secondaryAccountDocument: Documents.Account;
          let loanAccountDocument: Documents.Account;
          let projectDocument: Documents.Project;
          let secondaryProjectDocument: Documents.Project;
          let recipientDocument: Documents.Recipient;
          let secondaryRecipientDocument: Documents.Recipient;
          let regularCategoryDocument: Documents.Category;
          let inventoryCategoryDocument: Documents.Category;
          let invoiceCategoryDocument: Documents.Category;
          let secondaryCategoryDocument: Documents.Category;
          let productDocument: Documents.Product;
          let secondaryProductDocument: Documents.Product;

          let splitTransactionDocument: Documents.SplitTransaction;
          let includedPaymentTransactionDocument: Documents.PaymentTransaction;
          let includedLoanTransactionDocument: Documents.LoanTransaction;
          let includedRepaymentTransactionDocument: Documents.LoanTransaction;
          let excludedPaymentTransactionDocument: Documents.PaymentTransaction;
          let excludedLoanTransactionDocument: Documents.LoanTransaction;
          let excludedRepaymentTransactionDocument: Documents.LoanTransaction;
          let deferredSplitTransactionDocument: Documents.SplitTransaction;
          let transferTransactionDocument: Documents.TransferTransaction;
          let loanTransferTransactionDocument: Documents.TransferTransaction;

          test.beforeEach(async ({ saveAccounts, saveTransactions, saveCategories, saveProjects, saveRecipients, saveProducts }) => {
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

            productDocument = productDataFactory.document.generic();
            secondaryProductDocument = productDataFactory.document.generic();

            transferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: secondaryAccountDocument,
            });

            loanTransferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: loanAccountDocument,
            });

            await saveRecipients(recipientDocument, secondaryRecipientDocument);
            await saveAccounts(accountDocument, secondaryAccountDocument, loanAccountDocument);
            await saveCategories(regularCategoryDocument, invoiceCategoryDocument, inventoryCategoryDocument, secondaryCategoryDocument);
            await saveProjects(projectDocument, secondaryProjectDocument);
            await saveProducts(productDocument, secondaryProductDocument);
            await saveTransactions(transferTransactionDocument, loanTransferTransactionDocument);
          });

          test.describe('filtered by account', () => {
            test.beforeEach(async ({ saveTransactions }) => {
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

              includedLoanTransactionDocument = loanTransactionDataFactory.document({
                loanAccount: loanAccountDocument,
                account: secondaryAccountDocument,
                recipient: recipientDocument,
              });

              includedRepaymentTransactionDocument = loanTransactionDataFactory.document({
                account: loanAccountDocument,
                loanAccount: accountDocument,
                recipient: recipientDocument,
              });

              excludedPaymentTransactionDocument = paymentTransactionDataFactory.document({
                account: secondaryAccountDocument,
                recipient: recipientDocument,
              });

              excludedLoanTransactionDocument = loanTransactionDataFactory.document({
                loanAccount: loanAccountDocument,
                account: accountDocument,
                recipient: recipientDocument,
              });

              excludedRepaymentTransactionDocument = loanTransactionDataFactory.document({
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

              await saveTransactions(includedPaymentTransactionDocument, splitTransactionDocument, includedLoanTransactionDocument, includedRepaymentTransactionDocument, excludedPaymentTransactionDocument, excludedLoanTransactionDocument, excludedRepaymentTransactionDocument, deferredSplitTransactionDocument);
            });
            test('to include', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: [getAccountId(accountDocument)],
                  include: true, 
                }, 
              ]);
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(schema);
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, ])

            });
          });

          test.describe('filtered by recipient', () => {
            test.beforeEach(async ({ saveTransactions }) => {
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

              includedLoanTransactionDocument = loanTransactionDataFactory.document({
                loanAccount: accountDocument,
                account: secondaryAccountDocument,
                recipient: recipientDocument,
              });

              includedRepaymentTransactionDocument = loanTransactionDataFactory.document({
                account: loanAccountDocument,
                loanAccount: accountDocument,
                recipient: recipientDocument,
              });

              excludedPaymentTransactionDocument = paymentTransactionDataFactory.document({
                account: accountDocument,
                recipient: secondaryRecipientDocument,
              });

              excludedLoanTransactionDocument = loanTransactionDataFactory.document({
                loanAccount: loanAccountDocument,
                account: secondaryAccountDocument,
                recipient: secondaryRecipientDocument,
              });

              excludedRepaymentTransactionDocument = loanTransactionDataFactory.document({
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

              await saveTransactions(includedPaymentTransactionDocument, splitTransactionDocument, includedLoanTransactionDocument, includedRepaymentTransactionDocument, excludedPaymentTransactionDocument, excludedLoanTransactionDocument, excludedRepaymentTransactionDocument, deferredSplitTransactionDocument);
            });
            test('to include', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'recipient',
                  items: [getRecipientId(recipientDocument)],
                  include: true, 
                }, 
              ]);
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(schema);
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, ])

            });
          });

          test.describe('filtered by project', () => {
            test.beforeEach(async ({ saveTransactions }) => {
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

              includedLoanTransactionDocument = loanTransactionDataFactory.document({
                loanAccount: accountDocument,
                account: secondaryAccountDocument,
                project: projectDocument,
              });

              includedRepaymentTransactionDocument = loanTransactionDataFactory.document({
                account: loanAccountDocument,
                loanAccount: accountDocument,
                project: projectDocument,
              });

              excludedPaymentTransactionDocument = paymentTransactionDataFactory.document({
                account: accountDocument,
                project: secondaryProjectDocument,
              });

              excludedLoanTransactionDocument = loanTransactionDataFactory.document({
                loanAccount: accountDocument,
                account: secondaryAccountDocument,
                project: secondaryProjectDocument,
              });

              excludedRepaymentTransactionDocument = loanTransactionDataFactory.document({
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

              await saveTransactions(includedPaymentTransactionDocument, splitTransactionDocument, includedLoanTransactionDocument, includedRepaymentTransactionDocument, excludedPaymentTransactionDocument, excludedLoanTransactionDocument, excludedRepaymentTransactionDocument, deferredSplitTransactionDocument);
            });
            test('to include', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'project',
                  items: [getProjectId(projectDocument)],
                  include: true, 
                }, 
              ]);
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(schema);
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[1]), splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[1]), ])

            });
          });

          test.describe('filtered by category', () => {
            test.beforeEach(async ({ saveTransactions }) => {
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

              includedLoanTransactionDocument = loanTransactionDataFactory.document({
                loanAccount: accountDocument,
                account: secondaryAccountDocument,
                category: invoiceCategoryDocument,
              });

              includedRepaymentTransactionDocument = loanTransactionDataFactory.document({
                account: loanAccountDocument,
                loanAccount: accountDocument,
                category: regularCategoryDocument,
              });

              excludedPaymentTransactionDocument = paymentTransactionDataFactory.document({
                account: accountDocument,
                category: secondaryCategoryDocument,
              });

              excludedLoanTransactionDocument = loanTransactionDataFactory.document({
                loanAccount: accountDocument,
                account: secondaryAccountDocument,
                category: secondaryCategoryDocument,
              });

              excludedRepaymentTransactionDocument = loanTransactionDataFactory.document({
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

              await saveTransactions(includedPaymentTransactionDocument, splitTransactionDocument, includedLoanTransactionDocument, includedRepaymentTransactionDocument, excludedPaymentTransactionDocument, excludedLoanTransactionDocument, excludedRepaymentTransactionDocument, deferredSplitTransactionDocument);
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(schema);
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[3]), splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[1]), ])

            });
          });

          test.describe('filtered by product', () => {
            test.beforeEach(async ({ saveTransactions }) => {
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

              includedLoanTransactionDocument = loanTransactionDataFactory.document({
                loanAccount: accountDocument,
                account: secondaryAccountDocument,
                category: inventoryCategoryDocument,
                product: productDocument,
              });

              includedRepaymentTransactionDocument = loanTransactionDataFactory.document({
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

              excludedLoanTransactionDocument = loanTransactionDataFactory.document({
                loanAccount: accountDocument,
                account: secondaryAccountDocument,
                category: inventoryCategoryDocument,
                product: secondaryProductDocument,
              });

              excludedRepaymentTransactionDocument = loanTransactionDataFactory.document({
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

              await saveTransactions(includedPaymentTransactionDocument, splitTransactionDocument, includedLoanTransactionDocument, includedRepaymentTransactionDocument, excludedPaymentTransactionDocument, excludedLoanTransactionDocument, excludedRepaymentTransactionDocument, deferredSplitTransactionDocument);
            });
            test('to include', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'product',
                  items: [getProductId(productDocument)],
                  include: true, 
                }, 
              ]);
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(schema);
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, splitTransactionHelper(splitTransactionDocument, splitTransactionDocument.splits[1]), splitTransactionHelper(deferredSplitTransactionDocument, deferredSplitTransactionDocument.deferredSplits[1]), ])

            });
          });

          test.describe('filtered by issuedAt', () => {
            test.beforeEach(async ({ saveTransactions }) => {
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

              includedLoanTransactionDocument = loanTransactionDataFactory.document({
                body: {
                  issuedAt: new Date(2024, 7, 5, 12, 20, 0).toISOString(),
                },
                loanAccount: accountDocument,
                account: secondaryAccountDocument,
              });

              includedRepaymentTransactionDocument = loanTransactionDataFactory.document({
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

              excludedLoanTransactionDocument = loanTransactionDataFactory.document({
                body: {
                  issuedAt: new Date(2024, 7, 3, 12, 0, 0).toISOString(),
                },
                loanAccount: accountDocument,
                account: secondaryAccountDocument,
              });

              excludedRepaymentTransactionDocument = loanTransactionDataFactory.document({
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

              await saveTransactions(includedPaymentTransactionDocument, splitTransactionDocument, includedLoanTransactionDocument, includedRepaymentTransactionDocument, excludedPaymentTransactionDocument, excludedLoanTransactionDocument, excludedRepaymentTransactionDocument, deferredSplitTransactionDocument);
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(schema);
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
              transactionApiExpect(res).toBeOkResponse();
              transactionApiExpect(res).toMatchSchema(schema);
              // TODO: validateTransactionListReport([ excludedPaymentTransactionDocument, excludedDeferredTransactionDocument, excludedReimbursementTransactionDocument, ])

            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('is not an array', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports({} as any);
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'data', 'array');
            });

            test('does not have at least one item', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([]);
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveTooFewItemsValidationError('body', 'data', 1);
            });
          });

          test.describe('if body[0]', () => {
            test('has additional properties', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: [accountDataFactory.id()],
                  include: true,
                  extra: 1, 
                } as any, 
              ]);
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveAdditionalPropertiesValidationError('body', '0', 'extra');
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
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveRequiredPropertyValidationError('body', 'from');
              transactionApiExpect(res).toHaveRequiredPropertyValidationError('body', 'to');
            });
          });

          test.describe('if body[0].include', () => {
            test('is missing', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: [accountDataFactory.id()],
                  include: undefined, 
                }, 
              ]);
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveRequiredPropertyValidationError('body', 'include');
            });

            test('is not boolean', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: [accountDataFactory.id()],
                  include: 1 as any, 
                }, 
              ]);
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'include', 'boolean');
            });
          });

          test.describe('if body[0].filterType', () => {
            test('is missing', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: undefined,
                  items: [accountDataFactory.id()],
                  include: false, 
                }, 
              ]);
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveRequiredPropertyValidationError('body', 'filterType');
            });
            test('is not string', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 1 as any,
                  items: [accountDataFactory.id()],
                  include: false, 
                }, 
              ]);
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'filterType', 'string');
            });
            test('is not a valid enum value', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'not filter type' as any,
                  items: [accountDataFactory.id()],
                  include: false, 
                }, 
              ]);
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveEnumValidationError('body', 'filterType');
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
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveRequiredPropertyValidationError('body', 'items');
            });
            test('is not an array', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: 1 as any,
                  include: false, 
                }, 
              ]);
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'items', 'array');
            });
            test('has less than 1 item', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: [],
                  include: false, 
                }, 
              ]);
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveTooFewItemsValidationError('body', 'items', 1);
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
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'items/0', 'string');
            });
            test('does not match pattern', async ({ requestGetTransactionReports }) => {
              const res = await requestGetTransactionReports([
                {
                  filterType: 'account',
                  items: ['not mongo id' as any],
                  include: false, 
                }, 
              ]);
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHavePatternValidationError('body', 'items/0');
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
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'from', 'string');
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
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongFormatValidationError('body', 'from', 'date-time');
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
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongTypeValidationError('body', 'to', 'string');
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
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveWrongFormatValidationError('body', 'to', 'date-time');
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
              transactionApiExpect(res).toBeBadRequestResponse();
              transactionApiExpect(res).toHaveTooEarlyDateValidationError('body', 'to', true);
            });
          });
        });
      }
    });
  });
});
