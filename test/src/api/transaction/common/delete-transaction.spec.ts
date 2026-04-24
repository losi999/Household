import { entries, getCalendarEntryId, getTransactionId } from '@household/shared/common/utils';
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

import { test as transactionApiTest, expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { expect as calendarApiExpect } from '@household/test/fixtures/calendar-api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { test as transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { test as calendarEntryDbTest } from '@household/test/fixtures/calendar-entry-db.fixture';
import { test as customerDbTest } from '@household/test/fixtures/customer-db.fixture';

const expect = mergeExpects(transactionApiExpect, apiExpect, calendarApiExpect);

const permissionMap = forbidUsers('viewer') ;

const test = mergeTests(transactionApiTest, accountDbTest, transactionDbTest, calendarEntryDbTest, customerDbTest);

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
          test('payment transaction', async ({ requestDeleteTransaction, saveAccount, saveTransaction, findTransactionById, saveCalendarEntry, saveCustomer, getCalendarEntryById }) => {
            const customerDocument = customerDataFactory.document();
            const calendarWorkEntryDocument = calendarEntryDataFactory.document.work({
              customer: customerDocument,
              resolution: {
                transaction: paymentTransactionDocument,
              },
            });

            await saveAccount(accountDocument);
            await saveTransaction(paymentTransactionDocument);
            await saveCustomer(customerDocument);
            await saveCalendarEntry(calendarWorkEntryDocument);
            const res = await requestDeleteTransaction(getTransactionId(paymentTransactionDocument));
            expect(res).toBeNoContentResponse();

            expect(await findTransactionById(getTransactionId(paymentTransactionDocument))).toHaveBeenDeletedFromDatabase();
            expect(calendarWorkEntryDocument).toHaveBeenUnresolved(await getCalendarEntryById(getCalendarEntryId(calendarWorkEntryDocument)));
          });

          test('split transaction', async ({ requestDeleteTransaction, saveAccounts, saveTransactions, findTransactionById }) => {
            const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: transferAccountDocument,
              transactions: [splitTransactionDocument.deferredSplits[0]],
            });

            await saveAccounts(accountDocument, transferAccountDocument, loanAccountDocument);
            await saveTransactions(splitTransactionDocument, repayingTransferTransactionDocument);
            const res = await requestDeleteTransaction(getTransactionId(splitTransactionDocument));
            expect(res).toBeNoContentResponse();

            expect(await findTransactionById(getTransactionId(splitTransactionDocument))).toHaveBeenDeletedFromDatabase();

            expect(repayingTransferTransactionDocument).toHavePaymentRemoved(await findTransactionById(getTransactionId(repayingTransferTransactionDocument)), getTransactionId(splitTransactionDocument.deferredSplits[0]));
            
          });

          test('transfer transaction', async ({ requestDeleteTransaction, saveAccounts, saveTransaction, findTransactionById }) => {
            await saveAccounts(accountDocument, transferAccountDocument);
            await saveTransaction(transferTransactionDocument);
            const res = await requestDeleteTransaction(getTransactionId(transferTransactionDocument));
            expect(res).toBeNoContentResponse();

            expect(await findTransactionById(getTransactionId(transferTransactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('deferred transaction', async ({ requestDeleteTransaction, saveAccounts, saveTransactions, findTransactionById }) => {
            const repayingTransferTransactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: transferAccountDocument,
              transactions: [deferredTransactionDocument],
            });

            await saveAccounts(accountDocument, transferAccountDocument, loanAccountDocument);
            await saveTransactions(deferredTransactionDocument, repayingTransferTransactionDocument);
            const res = await requestDeleteTransaction(getTransactionId(deferredTransactionDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findTransactionById(getTransactionId(deferredTransactionDocument))).toHaveBeenDeletedFromDatabase();

            expect(repayingTransferTransactionDocument).toHavePaymentRemoved(await findTransactionById(getTransactionId(repayingTransferTransactionDocument)), getTransactionId(deferredTransactionDocument));
          });

          test('reimbursement transaction', async ({ requestDeleteTransaction, saveAccounts, saveTransaction, findTransactionById }) => {
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveTransaction(reimbursementTransactionDocument);
            const res = await requestDeleteTransaction(getTransactionId(reimbursementTransactionDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findTransactionById(getTransactionId(reimbursementTransactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('loan transfer transaction', async ({ requestDeleteTransaction, saveAccounts, saveTransaction, findTransactionById }) => {
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveTransaction(loanTransferTransactionDocument);
            const res = await requestDeleteTransaction(getTransactionId(loanTransferTransactionDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findTransactionById(getTransactionId(loanTransferTransactionDocument))).toHaveBeenDeletedFromDatabase();
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
