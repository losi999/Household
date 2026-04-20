import { entries, getTransactionId } from '@household/shared/common/utils';
import { AccountType } from '@household/shared/enums';
import { Account, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { forbidUsers } from '@household/test/utils';

import { test, expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { accountService, calendarEntryService, customerService, transactionService } from '@household/test/dependencies';

const expect = mergeExpects(transactionApiExpect, apiExpect);

const permissionMap = forbidUsers('viewer') ;

test.describe('DELETE /transaction/v1/transactions/{transactionId}', () => {
  let accountDocument: Account.Document;
  let loanAccountDocument: Account.Document;
  let transferAccountDocument: Account.Document;
  let paymentTransactionDocument: Transaction.PaymentDocument;
  let splitTransactionDocument: Transaction.SplitDocument;
  let transferTransactionDocument: Transaction.TransferDocument;
  let deferredTransactionDocument: Transaction.DeferredDocument;
  let reimbursementTransactionDocument: Transaction.ReimbursementDocument;
  let loanTransferTransactionDocument: Transaction.TransferDocument;

  test.beforeEach(async () => {
    accountDocument = accountDataFactory.document();
    transferAccountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: AccountType.Loan,
    });

    paymentTransactionDocument = paymentTransactionDataFactory.document({
      account: accountDocument,
    });

    splitTransactionDocument = splitTransactionDataFactory.document({
      account: accountDocument,
      loans: [
        {
          loanAccount: loanAccountDocument,
        },
      ],
    });

    transferTransactionDocument = transferTransactionDataFactory.document({
      account: accountDocument,
      transferAccount: transferAccountDocument,
    });

    deferredTransactionDocument = deferredTransactionDataFactory.document({
      account: accountDocument,
      loanAccount: loanAccountDocument,
    });

    reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
      account: loanAccountDocument,
      loanAccount: accountDocument,
    });

    loanTransferTransactionDocument = transferTransactionDataFactory.document({
      account: accountDocument,
      transferAccount: loanAccountDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteTransaction }) => {
      const res = await requestDeleteTransaction(paymentTransactionDataFactory.id());
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
        test('should return forbidden', async ({ requestDeleteTransaction }) => {
          const res = await requestDeleteTransaction(paymentTransactionDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should delete', () => {
          test('payment transaction', async ({ requestDeleteTransaction }) => {
            const customerDocument = customerDataFactory.document();
            const calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
              customer: customerDocument,
              resolution: {
                transaction: paymentTransactionDocument,
              },
            });

            await accountService.saveAccount(accountDocument);
            await transactionService.saveTransaction(paymentTransactionDocument);
            await customerService.saveCustomer(customerDocument);
            await calendarEntryService.saveCalendarEntry(calendarWorkEntryDocument);
            const res = await requestDeleteTransaction(getTransactionId(paymentTransactionDocument));
            expect(res).toBeNoContentResponse();

            expect(await transactionService.findTransactionById(getTransactionId(paymentTransactionDocument))).toHaveBeenDeletedFromDatabase();
            // TODO: validateRelatedCalendarWorkEntryUnresolved(calendarWorkEntryDocument)
          });

          test('split transaction', async ({ requestDeleteTransaction }) => {
            const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: transferAccountDocument,
              transactions: [splitTransactionDocument.deferredSplits[0]],
            });

            await accountService.saveAccounts(accountDocument, transferAccountDocument, loanAccountDocument);
            await transactionService.saveTransactions(splitTransactionDocument, repayingTransferTransactionDocument);
            const res = await requestDeleteTransaction(getTransactionId(splitTransactionDocument));
            expect(res).toBeNoContentResponse();

            expect(await transactionService.findTransactionById(getTransactionId(splitTransactionDocument))).toHaveBeenDeletedFromDatabase();
            // TODO: validateRelatedRepaymentDeleted(getTransactionId(splitTransactionDocument.deferredSplits[0]), getTransactionId(repayingTransferTransactionDocument))
          });

          test('transfer transaction', async ({ requestDeleteTransaction }) => {
            await accountService.saveAccounts(accountDocument, transferAccountDocument);
            await transactionService.saveTransaction(transferTransactionDocument);
            const res = await requestDeleteTransaction(getTransactionId(transferTransactionDocument));
            expect(res).toBeNoContentResponse();

            expect(await transactionService.findTransactionById(getTransactionId(transferTransactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('deferred transaction', async ({ requestDeleteTransaction }) => {
            const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: transferAccountDocument,
              transactions: [deferredTransactionDocument],
            });

            await accountService.saveAccounts(accountDocument, transferAccountDocument, loanAccountDocument);
            await transactionService.saveTransactions(deferredTransactionDocument, repayingTransferTransactionDocument);
            const res = await requestDeleteTransaction(getTransactionId(deferredTransactionDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await transactionService.findTransactionById(getTransactionId(deferredTransactionDocument))).toHaveBeenDeletedFromDatabase();
            // TODO: validateRelatedRepaymentDeleted(getTransactionId(deferredTransactionDocument), getTransactionId(repayingTransferTransactionDocument))
          });

          test('reimbursement transaction', async ({ requestDeleteTransaction }) => {
            await accountService.saveAccounts(accountDocument, loanAccountDocument);
            await transactionService.saveTransaction(reimbursementTransactionDocument);
            const res = await requestDeleteTransaction(getTransactionId(reimbursementTransactionDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await transactionService.findTransactionById(getTransactionId(reimbursementTransactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('loan transfer transaction', async ({ requestDeleteTransaction }) => {
            await accountService.saveAccounts(accountDocument, loanAccountDocument);
            await transactionService.saveTransaction(loanTransferTransactionDocument);
            const res = await requestDeleteTransaction(getTransactionId(loanTransferTransactionDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await transactionService.findTransactionById(getTransactionId(loanTransferTransactionDocument))).toHaveBeenDeletedFromDatabase();
          });
        });
        test.describe('should return error', () => {
          test.describe('if transactionId', () => {
            test('is not mongo id', async ({ requestDeleteTransaction }) => {
              const res = await requestDeleteTransaction(paymentTransactionDataFactory.id('not-valid'));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'transactionId');
            });
          });
        });
      }
    });
  });
});
