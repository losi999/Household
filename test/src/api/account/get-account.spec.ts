import { response as schema } from '@household/shared/schemas/account';
import { Documents } from '@household/shared/types/documents';
import { entries, getAccountId } from '@household/shared/common/utils';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { loanTransactionDataFactory } from '@household/test/api/transaction/loan/loan-data-factory';
import { AccountType } from '@household/shared/enums';
import { forbidUsers } from '@household/test/utils';
import { accountApiTest as accountApiTest, accountApiExpect as accountApiExpect } from '@household/test/fixtures/account-api.fixture';
import { mergeTests } from '@playwright/test';
import { accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';

const permissionMap = forbidUsers();

const test = mergeTests(accountApiTest, accountDbTest, transactionDbTest);

test.describe('GET /account/v1/accounts/{accountId}', () => {
  let accountDocument: Documents.Account;
  let loanAccountDocument: Documents.Account;
  let secondaryAccountDocument: Documents.Account;
  let paymentTransactionDocument: Documents.PaymentTransaction;
  let splitTransactionDocument: Documents.SplitTransaction;
  let transferTransactionDocument: Documents.TransferTransaction;
  let invertedTransferTransactionDocument: Documents.TransferTransaction;
  let loanTransferTransactionDocument: Documents.TransferTransaction;
  let invertedLoanTransferTransactionDocument: Documents.TransferTransaction;
  let loanTransactionDocument: Documents.LoanTransaction;
  let repaymentTransactionDocument: Documents.LoanTransaction;
  let loanSplitTransactionDocument: Documents.SplitTransaction;

  test.beforeEach(async () => {
    accountDocument = accountDataFactory.document();
    secondaryAccountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: AccountType.Loan,
    });

    paymentTransactionDocument = paymentTransactionDataFactory.document({
      account: accountDocument,
    });

    splitTransactionDocument = splitTransactionDataFactory.document({
      account: accountDocument,
    });

    loanSplitTransactionDocument = splitTransactionDataFactory.document({
      account: secondaryAccountDocument,
      loans: [
        {
          loanAccount: loanAccountDocument,
        },
      ],
    });

    transferTransactionDocument = transferTransactionDataFactory.document({
      account: accountDocument,
      transferAccount: secondaryAccountDocument,
    });

    invertedTransferTransactionDocument = transferTransactionDataFactory.document({
      account: secondaryAccountDocument,
      transferAccount: accountDocument,
    });

    loanTransferTransactionDocument = transferTransactionDataFactory.document({
      account: accountDocument,
      transferAccount: loanAccountDocument,
    });

    invertedLoanTransferTransactionDocument = transferTransactionDataFactory.document({
      account: loanAccountDocument,
      transferAccount: accountDocument,
    });

    loanTransactionDocument = loanTransactionDataFactory.document({
      account: accountDocument,
      loanAccount: loanAccountDocument,
    });

    repaymentTransactionDocument = loanTransactionDataFactory.document({
      account: loanAccountDocument,
      loanAccount: accountDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestGetAccount }) => {
      const res = await requestGetAccount(accountDataFactory.id());
      accountApiExpect(res).toBeUnauthorizedResponse();
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
        test('should return forbidden', async ({ requestGetAccount }) => {
          const res = await requestGetAccount(accountDataFactory.id());
          accountApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.beforeEach(async ({ saveAccounts, saveTransactions }) => {
          await saveAccounts(loanAccountDocument, accountDocument, secondaryAccountDocument);
          await saveTransactions(paymentTransactionDocument, splitTransactionDocument, transferTransactionDocument, invertedTransferTransactionDocument, loanTransferTransactionDocument, invertedLoanTransferTransactionDocument, loanTransactionDocument, repaymentTransactionDocument, loanSplitTransactionDocument);
        });
        test('should get account by id', async ({ requestGetAccount }) => {
          const expectedBalance = paymentTransactionDocument.amount + transferTransactionDocument.amount + invertedTransferTransactionDocument.transferAmount + splitTransactionDocument.amount + loanTransferTransactionDocument.amount + invertedLoanTransferTransactionDocument.transferAmount + loanTransactionDocument.amount;

          const res = await requestGetAccount(getAccountId(accountDocument));
          accountApiExpect(res).toBeOkResponse();
          accountApiExpect(res).toMatchSchema(schema);
          accountApiExpect(res).toMatchAccountDocument(accountDocument, expectedBalance);
        });

        test('should get loan account by id', async ({ requestGetAccount }) => {
          const expectedBalance = loanTransferTransactionDocument.transferAmount + invertedLoanTransferTransactionDocument.amount - loanSplitTransactionDocument.loans[0].amount + repaymentTransactionDocument.amount - loanTransactionDocument.amount;

          const res = await requestGetAccount(getAccountId(loanAccountDocument));
          accountApiExpect(res).toBeOkResponse();
          accountApiExpect(res).toMatchSchema(schema);
          accountApiExpect(res).toMatchAccountDocument(loanAccountDocument, expectedBalance);
        });

        test.describe('should return error if accountId', () => {
          test('is not mongo id', async ({ requestGetAccount }) => {
            const res = await requestGetAccount(accountDataFactory.id('not-valid'));
            accountApiExpect(res).toBeBadRequestResponse();
            accountApiExpect(res).toHavePatternValidationError('pathParameters', 'accountId');
          });

          test('does not belong to any account', async ({ requestGetAccount }) => {
            const res = await requestGetAccount(accountDataFactory.id());
            accountApiExpect(res).toBeNotFoundResponse();
          });
        });
      }
    });
  });
});
