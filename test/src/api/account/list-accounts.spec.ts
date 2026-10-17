import { responseList as schema } from '@household/shared/schemas/account';
import { Documents } from '@household/shared/types/documents';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { loanTransactionDataFactory } from '@household/test/api/transaction/loan/loan-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { AccountType } from '@household/shared/enums';
import { forbidUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';

import { accountApiTest as accountApiTest, accountApiExpect as accountApiExpect } from '@household/test/fixtures/account-api.fixture';
import { mergeTests } from '@playwright/test';
import { accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';

const permissionMap = forbidUsers();

const test = mergeTests(accountApiTest, accountDbTest, transactionDbTest);

test.describe('GET /account/v1/accounts', () => {
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
    test('should return unauthorized', async ({ requestListAccounts }) => {
      const res = await requestListAccounts();
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
        test('should return forbidden', async ({ requestListAccounts }) => {
          const res = await requestListAccounts();
          accountApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of accounts', async ({ requestListAccounts, saveAccounts, saveTransactions }) => {
          const expectedBalance1 = paymentTransactionDocument.amount + transferTransactionDocument.amount + invertedTransferTransactionDocument.transferAmount + splitTransactionDocument.amount + loanTransferTransactionDocument.amount + invertedLoanTransferTransactionDocument.transferAmount + loanTransactionDocument.amount;

          const expectedBalance2 = loanTransferTransactionDocument.transferAmount + invertedLoanTransferTransactionDocument.amount - loanSplitTransactionDocument.loans[0].amount + repaymentTransactionDocument.amount - loanTransactionDocument.amount;

          await saveAccounts(loanAccountDocument, accountDocument, secondaryAccountDocument);
          await saveTransactions(paymentTransactionDocument, splitTransactionDocument, transferTransactionDocument, invertedTransferTransactionDocument, loanTransferTransactionDocument, invertedLoanTransferTransactionDocument, loanTransactionDocument, repaymentTransactionDocument, loanSplitTransactionDocument);
          const res = await requestListAccounts();
          accountApiExpect(res).toBeOkResponse();
          accountApiExpect(res).toMatchSchema(schema);
          accountApiExpect(res).toContainMatchingAccountDocument(accountDocument, expectedBalance1);
          accountApiExpect(res).toContainMatchingAccountDocument(loanAccountDocument, expectedBalance2);
        });
      }
    });
  });
});
