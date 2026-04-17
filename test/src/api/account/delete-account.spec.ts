import { entries, getAccountId, getTransactionId } from '@household/shared/common/utils';
import { AccountType } from '@household/shared/enums';
import { Account, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { allowUsers } from '@household/test/utils';
import { test, expect as accountApiExpect } from '@household/test/fixtures/account-api.fixture';
import { expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { accountService, transactionService } from '@household/test/dependencies';

const expect = mergeExpects(accountApiExpect, transactionApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

test.describe('DELETE /account/v1/accounts/{accountId}', () => {
  let accountDocument: Account.Document;

  test.beforeEach(async () => {
    accountDocument = accountDataFactory.document();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteAccount }) => {
      const res = await requestDeleteAccount(accountDataFactory.id());
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
        test('should return forbidden', async ({ requestDeleteAccount }) => {
          const res = await requestDeleteAccount(accountDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete account', async ({ requestDeleteAccount }) => {
          await accountService.saveAccount(accountDocument);
          const res = await requestDeleteAccount(getAccountId(accountDocument));
          expect(res).toBeNoContentResponse();

          expect(await accountService.findAccountById(getAccountId(accountDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('related transactions', () => {
          let loanAccountDocument: Account.Document;
          let secondaryAccountDocument: Account.Document;
          let paymentTransactionDocument: Transaction.PaymentDocument;
          let splitTransactionDocument: Transaction.SplitDocument;
          let transferTransactionDocument: Transaction.TransferDocument;
          let invertedTransferTransactionDocument: Transaction.TransferDocument;
          let repayingTransferTransactionDocument: Transaction.TransferDocument;
          let invertedRepayingTransferTransactionDocument: Transaction.TransferDocument;
          let loanTransferTransactionDocument: Transaction.TransferDocument;
          let invertedLoanTransferTransactionDocument: Transaction.TransferDocument;
          let payingDeferredTransactionDocument: Transaction.DeferredDocument;
          let owningDeferredTransactionDocument: Transaction.DeferredDocument;
          let payingDeferredToLoanTransactionDocument: Transaction.DeferredDocument;
          let owningReimbursementTransactionDocument: Transaction.ReimbursementDocument;
          let deferredSplitTransactionDocument: Transaction.SplitDocument;

          test.beforeEach(async () => {
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

            repayingTransferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: secondaryAccountDocument,
              transactions: [owningDeferredTransactionDocument],
            });

            invertedRepayingTransferTransactionDocument = transferTransactionDataFactory.document({
              account: secondaryAccountDocument,
              transferAccount: accountDocument,
              transactions: [payingDeferredTransactionDocument],
            });

          });
          test('should be deleted if account is deleted', async ({ requestDeleteAccount }) => {
            await accountService.saveAccounts(loanAccountDocument, accountDocument, secondaryAccountDocument);
            await transactionService.saveTransactions(paymentTransactionDocument, splitTransactionDocument, transferTransactionDocument, invertedTransferTransactionDocument, loanTransferTransactionDocument, invertedLoanTransferTransactionDocument, payingDeferredTransactionDocument, owningDeferredTransactionDocument, payingDeferredToLoanTransactionDocument, owningReimbursementTransactionDocument, deferredSplitTransactionDocument, repayingTransferTransactionDocument, invertedRepayingTransferTransactionDocument);
            const res = await requestDeleteAccount(getAccountId(accountDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await accountService.findAccountById(getAccountId(accountDocument))).toHaveBeenDeletedFromDatabase();
            expect(await transactionService.findTransactionById(getTransactionId(paymentTransactionDocument))).toHaveBeenDeletedFromDatabase();
            expect(await transactionService.findTransactionById(getTransactionId(splitTransactionDocument))).toHaveBeenDeletedFromDatabase();
            expect(await transactionService.findTransactionById(getTransactionId(transferTransactionDocument))).toHaveBeenDeletedFromDatabase();
            expect(await transactionService.findTransactionById(getTransactionId(invertedTransferTransactionDocument))).toHaveBeenDeletedFromDatabase();
            expect(await transactionService.findTransactionById(getTransactionId(loanTransferTransactionDocument))).toHaveBeenDeletedFromDatabase();
            expect(await transactionService.findTransactionById(getTransactionId(invertedLoanTransferTransactionDocument))).toHaveBeenDeletedFromDatabase();
            expect(await transactionService.findTransactionById(getTransactionId(payingDeferredTransactionDocument))).toHaveBeenDeletedFromDatabase();
            expect(await transactionService.findTransactionById(getTransactionId(payingDeferredToLoanTransactionDocument))).toHaveBeenDeletedFromDatabase();
            expect(await transactionService.findTransactionById(getTransactionId(owningReimbursementTransactionDocument))).toHaveBeenDeletedFromDatabase();
            expect(await transactionService.findTransactionById(getTransactionId(repayingTransferTransactionDocument))).toHaveBeenDeletedFromDatabase();
            expect(owningDeferredTransactionDocument).toBeConvertedToPaymentTransaction(await transactionService.findTransactionById(getTransactionId(owningDeferredTransactionDocument)));
            expect(deferredSplitTransactionDocument).toHaveBeenConvertedToRegularSplitItems(await transactionService.findTransactionById(getTransactionId(deferredSplitTransactionDocument)), getAccountId(accountDocument));
          });
        });

        test.describe('should return error', () => {
          test.describe('if accountId', () => {
            test('is not mongo id', async ({ requestDeleteAccount }) => {
              const res = await requestDeleteAccount(accountDataFactory.id('not-valid'));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'accountId');
            });
          });
        });
      }
    });
  });
});
