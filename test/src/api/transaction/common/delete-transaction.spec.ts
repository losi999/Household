import { entries, getCalendarEntryId, getTransactionId } from '@household/shared/common/utils';
import { AccountType } from '@household/shared/enums';
import { Documents } from '@household/shared/types/documents';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { calendarEntryDataFactory } from '@household/test/api/calendar/data-factory';
import { customerDataFactory } from '@household/test/api/customer/data-factory';
import { loanTransactionDataFactory } from '@household/test/api/transaction/loan/loan-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
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
  let accountDocument: Documents.Account;
  let loanAccountDocument: Documents.Account;
  let transferAccountDocument: Documents.Account;
  let paymentTransactionDocument: Documents.PaymentTransaction;
  let splitTransactionDocument: Documents.SplitTransaction;
  let transferTransactionDocument: Documents.TransferTransaction;
  let loanTransactionDocument: Documents.LoanTransaction;
  let repaymentTransactionDocument: Documents.LoanTransaction;
  let loanTransferTransactionDocument: Documents.TransferTransaction;

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

    loanTransactionDocument = loanTransactionDataFactory.document({
      account: accountDocument,
      loanAccount: loanAccountDocument,
    });

    repaymentTransactionDocument = loanTransactionDataFactory.document({
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
            await saveAccounts(accountDocument, transferAccountDocument, loanAccountDocument);
            await saveTransactions(splitTransactionDocument);
            const res = await requestDeleteTransaction(getTransactionId(splitTransactionDocument));
            expect(res).toBeNoContentResponse();

            expect(await findTransactionById(getTransactionId(splitTransactionDocument))).toHaveBeenDeletedFromDatabase();
            
          });

          test('transfer transaction', async ({ requestDeleteTransaction, saveAccounts, saveTransaction, findTransactionById }) => {
            await saveAccounts(accountDocument, transferAccountDocument);
            await saveTransaction(transferTransactionDocument);
            const res = await requestDeleteTransaction(getTransactionId(transferTransactionDocument));
            expect(res).toBeNoContentResponse();

            expect(await findTransactionById(getTransactionId(transferTransactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('deferred transaction', async ({ requestDeleteTransaction, saveAccounts, saveTransactions, findTransactionById }) => {
            await saveAccounts(accountDocument, transferAccountDocument, loanAccountDocument);
            await saveTransactions(loanTransactionDocument);
            const res = await requestDeleteTransaction(getTransactionId(loanTransactionDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findTransactionById(getTransactionId(loanTransactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('reimbursement transaction', async ({ requestDeleteTransaction, saveAccounts, saveTransaction, findTransactionById }) => {
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveTransaction(repaymentTransactionDocument);
            const res = await requestDeleteTransaction(getTransactionId(repaymentTransactionDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findTransactionById(getTransactionId(repaymentTransactionDocument))).toHaveBeenDeletedFromDatabase();
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
