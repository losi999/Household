import { entries, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { recipientApiTest, recipientApiExpect } from '@household/test/fixtures/recipient-api.fixture';
import { transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { Documents } from '@household/shared/types/documents';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { AccountType } from '@household/shared/enums';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { loanTransactionDataFactory } from '@household/test/api/transaction/loan/loan-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { mergeTests } from '@playwright/test';
import { accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { recipientDbTest } from '@household/test/fixtures/recipient-db.fixture';

const permissionMap = allowUsers('editor');

const test = mergeTests(recipientApiTest, accountDbTest, transactionDbTest, recipientDbTest);

test.describe('DELETE /recipient/v1/recipients/{recipientId}', () => {

  let recipientDocument: Documents.Recipient;

  test.beforeEach(async () => {
    recipientDocument = recipientDataFactory.document();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestDeleteRecipient }) => {
      const res = await requestDeleteRecipient(recipientDataFactory.id());
      recipientApiExpect(res).toBeUnauthorizedResponse();
    });
  });

  for (const [
    userType,
    isAllowed,
  ] of entries(permissionMap)) {
    test.describe(`called as ${userType}`, () => {
      test.use({
        userType,
      });

      if (!isAllowed) {
        test('should return forbidden', async ({ requestDeleteRecipient }) => {
          const res = await requestDeleteRecipient(recipientDataFactory.id());
          recipientApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete recipient', async ({ requestDeleteRecipient, saveRecipient, findRecipientById }) => {
          await saveRecipient(recipientDocument);

          const res = await requestDeleteRecipient(getRecipientId(recipientDocument));
          recipientApiExpect(res).toBeNoContentResponse();

          recipientApiExpect(await findRecipientById(getRecipientId(recipientDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('should unset recipient in related', () => {
          let accountDocument: Documents.Account;
          let loanAccountDocument: Documents.Account;

          test.beforeEach(async () => {
            accountDocument = accountDataFactory.document();
            loanAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });

          });

          test('payment transaction', async ({ requestDeleteRecipient, saveAccounts, saveTransactions, findTransactionById, saveRecipients, findRecipientById }) => {
            const paymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
              recipient: recipientDocument,
            });

            await saveAccounts(accountDocument, loanAccountDocument);
            await saveRecipients(recipientDocument);
            await saveTransactions(paymentTransactionDocument);

            const res = await requestDeleteRecipient(getRecipientId(recipientDocument));
            recipientApiExpect(res).toBeNoContentResponse();

            recipientApiExpect(await findRecipientById(getRecipientId(recipientDocument))).toHaveBeenDeletedFromDatabase();

            transactionApiExpect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(paymentTransactionDocument)), {
              recipient: {
                from: getRecipientId(recipientDocument),
              },
            });
          });

          test('loan transaction', async ({ requestDeleteRecipient, saveAccounts, saveTransactions, findTransactionById, saveRecipients, findRecipientById }) => {
            const loanTransactionDocument = loanTransactionDataFactory.document({
              account: accountDocument,
              recipient: recipientDocument,
              loanAccount: loanAccountDocument,
            });

            await saveAccounts(accountDocument, loanAccountDocument);
            await saveRecipients(recipientDocument);
            await saveTransactions(loanTransactionDocument);

            const res = await requestDeleteRecipient(getRecipientId(recipientDocument));
            recipientApiExpect(res).toBeNoContentResponse();

            recipientApiExpect(await findRecipientById(getRecipientId(recipientDocument))).toHaveBeenDeletedFromDatabase();

            transactionApiExpect(loanTransactionDocument).toHaveRelatedDocumentsChangedInLoanTransaction(await findTransactionById(getTransactionId(loanTransactionDocument)), {
              recipient: {
                from: getRecipientId(recipientDocument),
              },
            });
          });

          test('repayment transaction', async ({ requestDeleteRecipient, saveAccounts, saveTransactions, findTransactionById, saveRecipients, findRecipientById }) => {
            const repaymentTransactionDocument = loanTransactionDataFactory.document({
              account: loanAccountDocument,
              recipient: recipientDocument,
              loanAccount: accountDocument,
            });
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveRecipients(recipientDocument);
            await saveTransactions(repaymentTransactionDocument);

            const res = await requestDeleteRecipient(getRecipientId(recipientDocument));
            recipientApiExpect(res).toBeNoContentResponse();

            recipientApiExpect(await findRecipientById(getRecipientId(recipientDocument))).toHaveBeenDeletedFromDatabase();

            transactionApiExpect(repaymentTransactionDocument).toHaveRelatedDocumentsChangedInLoanTransaction(await findTransactionById(getTransactionId(repaymentTransactionDocument)), {
              recipient: {
                from: getRecipientId(recipientDocument),
              },
            });
          });

          test('split transaction', async ({ requestDeleteRecipient, saveAccounts, saveTransactions, findTransactionById, saveRecipients, findRecipientById }) => {
            const splitTransactionDocument = splitTransactionDataFactory.document({
              account: accountDocument,
              recipient: recipientDocument,
            });
            
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveRecipients(recipientDocument);
            await saveTransactions(splitTransactionDocument);

            const res = await requestDeleteRecipient(getRecipientId(recipientDocument));
            recipientApiExpect(res).toBeNoContentResponse();

            recipientApiExpect(await findRecipientById(getRecipientId(recipientDocument))).toHaveBeenDeletedFromDatabase();

            transactionApiExpect(splitTransactionDocument).toHaveRelatedDocumentsChangedInSplitTransaction(await findTransactionById(getTransactionId(splitTransactionDocument)), {
              recipient: {
                from: getRecipientId(recipientDocument),
              },
            });
          });
        });

        test.describe('should return error', () => {
          test.describe('if recipientId', () => {
            test('is not mongo id', async ({ requestDeleteRecipient }) => {
              const res = await requestDeleteRecipient(recipientDataFactory.id('not-mongo-id'));

              recipientApiExpect(res).toBeBadRequestResponse();
              recipientApiExpect(res).toHavePatternValidationError('pathParameters', 'recipientId');
            });
          });
        });
      }
    });
  }
});
