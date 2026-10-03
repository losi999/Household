import { entries, getAccountId, getTransactionId } from '@household/shared/common/utils';
import { AccountType } from '@household/shared/enums';
import { Documents } from '@household/shared/types/documents';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { allowUsers } from '@household/test/utils';
import { test as accountApiTest, expect as accountApiExpect } from '@household/test/fixtures/account-api.fixture';
import { expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { test as transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';

const expect = mergeExpects(accountApiExpect, transactionApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

const test = mergeTests(accountApiTest, accountDbTest, transactionDbTest);

test.describe('DELETE /account/v1/accounts/{accountId}', () => {
  let accountDocument: Documents.Account;

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
        test('should delete account', async ({ requestDeleteAccount, saveAccount, findAccountById }) => {
          await saveAccount(accountDocument);
          const res = await requestDeleteAccount(getAccountId(accountDocument));
          expect(res).toBeNoContentResponse();

          expect(await findAccountById(getAccountId(accountDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('should delete related', () => {
          let loanAccountDocument: Documents.Account;
          let secondaryAccountDocument: Documents.Account;

          test.beforeEach(async () => {
            secondaryAccountDocument = accountDataFactory.document();
            loanAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });
          });

          test('payment transaction', async ({ requestDeleteAccount, saveAccounts, findAccountById, saveTransactions, findTransactionById }) => {
            const transactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
            });

            await saveAccounts(accountDocument);
            await saveTransactions(transactionDocument);
            const res = await requestDeleteAccount(getAccountId(accountDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findAccountById(getAccountId(accountDocument))).toHaveBeenDeletedFromDatabase();
            expect(await findTransactionById(getTransactionId(transactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('split transaction', async ({ requestDeleteAccount, saveAccounts, findAccountById, saveTransactions, findTransactionById }) => {
            const transactionDocument = splitTransactionDataFactory.document({
              account: accountDocument,
            });

            await saveAccounts(accountDocument);
            await saveTransactions(transactionDocument);
            const res = await requestDeleteAccount(getAccountId(accountDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findAccountById(getAccountId(accountDocument))).toHaveBeenDeletedFromDatabase();
            expect(await findTransactionById(getTransactionId(transactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('giving transfer transaction', async ({ requestDeleteAccount, saveAccounts, findAccountById, saveTransactions, findTransactionById }) => {
            const transactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: secondaryAccountDocument,
            });

            await saveAccounts(accountDocument, secondaryAccountDocument);
            await saveTransactions(transactionDocument);
            const res = await requestDeleteAccount(getAccountId(accountDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findAccountById(getAccountId(accountDocument))).toHaveBeenDeletedFromDatabase();
            expect(await findTransactionById(getTransactionId(transactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('receiving transfer transaction', async ({ requestDeleteAccount, saveAccounts, findAccountById, saveTransactions, findTransactionById }) => {
            const transactionDocument = transferTransactionDataFactory.document({
              account: secondaryAccountDocument,
              transferAccount: accountDocument,
            });

            await saveAccounts(accountDocument, secondaryAccountDocument);
            await saveTransactions(transactionDocument);
            const res = await requestDeleteAccount(getAccountId(accountDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findAccountById(getAccountId(accountDocument))).toHaveBeenDeletedFromDatabase();
            expect(await findTransactionById(getTransactionId(transactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('giving loan transfer transaction', async ({ requestDeleteAccount, saveAccounts, findAccountById, saveTransactions, findTransactionById }) => {
            const transactionDocument = transferTransactionDataFactory.document({
              account: accountDocument,
              transferAccount: loanAccountDocument,
            });

            await saveAccounts(loanAccountDocument, accountDocument);
            await saveTransactions(transactionDocument);
            const res = await requestDeleteAccount(getAccountId(accountDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findAccountById(getAccountId(accountDocument))).toHaveBeenDeletedFromDatabase();
            expect(await findTransactionById(getTransactionId(transactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('receiving loan transfer transaction', async ({ requestDeleteAccount, saveAccounts, findAccountById, saveTransactions, findTransactionById }) => {
            const transactionDocument = transferTransactionDataFactory.document({
              account: loanAccountDocument,
              transferAccount: accountDocument,
            });

            await saveAccounts(loanAccountDocument, accountDocument);
            await saveTransactions(transactionDocument);
            const res = await requestDeleteAccount(getAccountId(accountDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findAccountById(getAccountId(accountDocument))).toHaveBeenDeletedFromDatabase();
            expect(await findTransactionById(getTransactionId(transactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('paying deferred transaction', async ({ requestDeleteAccount, saveAccounts, findAccountById, saveTransactions, findTransactionById }) => {
            const transactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              loanAccount: secondaryAccountDocument,
            });
            
            await saveAccounts(accountDocument, secondaryAccountDocument);
            await saveTransactions(transactionDocument);
            const res = await requestDeleteAccount(getAccountId(accountDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findAccountById(getAccountId(accountDocument))).toHaveBeenDeletedFromDatabase();
            expect(await findTransactionById(getTransactionId(transactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('owning deferred transaction', async ({ requestDeleteAccount, saveAccounts, findAccountById, saveTransactions, findTransactionById }) => {
            const transactionDocument = deferredTransactionDataFactory.document({
              account: secondaryAccountDocument,
              loanAccount: accountDocument,
            });
            
            await saveAccounts(accountDocument, secondaryAccountDocument);
            await saveTransactions(transactionDocument);
            const res = await requestDeleteAccount(getAccountId(accountDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findAccountById(getAccountId(accountDocument))).toHaveBeenDeletedFromDatabase();
            expect(transactionDocument).toBeConvertedToPaymentTransaction(await findTransactionById(getTransactionId(transactionDocument)));

          });

          test('paying deferred transaction to loan account', async ({ requestDeleteAccount, saveAccounts, findAccountById, saveTransactions, findTransactionById }) => {
            const transactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              loanAccount: loanAccountDocument,
            });
            
            await saveAccounts(loanAccountDocument, accountDocument);
            await saveTransactions(transactionDocument);
            const res = await requestDeleteAccount(getAccountId(accountDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findAccountById(getAccountId(accountDocument))).toHaveBeenDeletedFromDatabase();
            expect(await findTransactionById(getTransactionId(transactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('owning reimbursement transaction', async ({ requestDeleteAccount, saveAccounts, findAccountById, saveTransactions, findTransactionById }) => {
            const transactionDocument = reimbursementTransactionDataFactory.document({
              account: loanAccountDocument,
              loanAccount: accountDocument,
            });
            
            await saveAccounts(loanAccountDocument, accountDocument);
            await saveTransactions(transactionDocument);
            const res = await requestDeleteAccount(getAccountId(accountDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findAccountById(getAccountId(accountDocument))).toHaveBeenDeletedFromDatabase();
            expect(await findTransactionById(getTransactionId(transactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('paying reimbursement transaction', async ({ requestDeleteAccount, saveAccounts, findAccountById, saveTransactions, findTransactionById }) => {
            const transactionDocument = reimbursementTransactionDataFactory.document({
              account: loanAccountDocument,
              loanAccount: accountDocument,
            });
            
            await saveAccounts(loanAccountDocument, accountDocument);
            await saveTransactions(transactionDocument);
            const res = await requestDeleteAccount(getAccountId(loanAccountDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findAccountById(getAccountId(loanAccountDocument))).toHaveBeenDeletedFromDatabase();
            expect(await findTransactionById(getTransactionId(transactionDocument))).toHaveBeenDeletedFromDatabase();
          });

          test('deferred split transaction', async ({ requestDeleteAccount, saveAccounts, findAccountById, saveTransactions, findTransactionById }) => {
            const transactionDocument = splitTransactionDataFactory.document({
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
            
            await saveAccounts(loanAccountDocument, accountDocument, secondaryAccountDocument);
            await saveTransactions(transactionDocument);
            const res = await requestDeleteAccount(getAccountId(accountDocument));
            expect(res).toBeNoContentResponse();
            
            expect(await findAccountById(getAccountId(accountDocument))).toHaveBeenDeletedFromDatabase();
            expect(transactionDocument).toHaveBeenConvertedToRegularSplitItems(await findTransactionById(getTransactionId(transactionDocument)), getAccountId(accountDocument));
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
