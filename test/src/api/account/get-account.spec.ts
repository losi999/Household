import { response as schema } from '@household/shared/schemas/account';
import { Documents } from '@household/shared/types/documents';
import { entries, getAccountId } from '@household/shared/common/utils';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { AccountType } from '@household/shared/enums';
import { forbidUsers } from '@household/test/utils';
import { test as accountApiTest, expect as accountApiExpect } from '@household/test/fixtures/account-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { test as transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';

const expect = mergeExpects(accountApiExpect, apiExpect);

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
  let payingDeferredTransactionDocument: Documents.DeferredTransaction;
  let owningDeferredTransactionDocument: Documents.DeferredTransaction;
  let payingDeferredToLoanTransactionDocument: Documents.DeferredTransaction;
  let owningReimbursementTransactionDocument: Documents.ReimbursementTransaction;
  let deferredSplitTransactionDocument: Documents.SplitTransaction;

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

    deferredSplitTransactionDocument = splitTransactionDataFactory.document({
      account: secondaryAccountDocument,
      loans: [
        {
          loanAccount: accountDocument,
        },
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

    payingDeferredTransactionDocument = deferredTransactionDataFactory.document({
      account: accountDocument,
      loanAccount: secondaryAccountDocument,
    });

    payingDeferredToLoanTransactionDocument = deferredTransactionDataFactory.document({
      account: accountDocument,
      loanAccount: loanAccountDocument,
    });

    owningDeferredTransactionDocument = deferredTransactionDataFactory.document({
      account: secondaryAccountDocument,
      loanAccount: accountDocument,
    });

    owningReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
      account: loanAccountDocument,
      loanAccount: accountDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestGetAccount }) => {
      const res = await requestGetAccount(accountDataFactory.id());
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
        test('should return forbidden', async ({ requestGetAccount }) => {
          const res = await requestGetAccount(accountDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.beforeEach(async ({ saveAccounts, saveTransactions }) => {
          await saveAccounts(loanAccountDocument, accountDocument, secondaryAccountDocument);
          await saveTransactions(paymentTransactionDocument, splitTransactionDocument, transferTransactionDocument, invertedTransferTransactionDocument, loanTransferTransactionDocument, invertedLoanTransferTransactionDocument, payingDeferredTransactionDocument, owningDeferredTransactionDocument, payingDeferredToLoanTransactionDocument, owningReimbursementTransactionDocument, deferredSplitTransactionDocument);
        });
        test('should get account by id', async ({ requestGetAccount }) => {
          const expectedBalance = paymentTransactionDocument.amount + transferTransactionDocument.amount + invertedTransferTransactionDocument.transferAmount + splitTransactionDocument.amount + loanTransferTransactionDocument.amount + invertedLoanTransferTransactionDocument.transferAmount + payingDeferredTransactionDocument.amount + payingDeferredToLoanTransactionDocument.amount;

          const res = await requestGetAccount(getAccountId(accountDocument));
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);
          expect(res).toMatchAccountDocument(accountDocument, expectedBalance);
        });

        test('should get loan account by id', async ({ requestGetAccount }) => {
          const expectedBalance = loanTransferTransactionDocument.transferAmount + invertedLoanTransferTransactionDocument.amount - deferredSplitTransactionDocument.deferredSplits[1].amount + owningReimbursementTransactionDocument.amount - payingDeferredToLoanTransactionDocument.amount;

          const res = await requestGetAccount(getAccountId(loanAccountDocument));
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);
          expect(res).toMatchAccountDocument(loanAccountDocument, expectedBalance);
        });

        test.describe('should return error if accountId', () => {
          test('is not mongo id', async ({ requestGetAccount }) => {
            const res = await requestGetAccount(accountDataFactory.id('not-valid'));
            expect(res).toBeBadRequestResponse();
            expect(res).toHavePatternValidationError('pathParameters', 'accountId');
          });

          test('does not belong to any account', async ({ requestGetAccount }) => {
            const res = await requestGetAccount(accountDataFactory.id());
            expect(res).toBeNotFoundResponse();
          });
        });
      }
    });
  });
});
