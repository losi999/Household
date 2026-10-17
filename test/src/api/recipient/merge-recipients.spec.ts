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

test.describe('POST /recipient/v1/recipients/{recipientId}/merge', () => {

  let sourceRecipientDocument: Documents.Recipient;
  let targetRecipientDocument: Documents.Recipient;

  test.beforeEach(async () => {
    sourceRecipientDocument = recipientDataFactory.document();
    targetRecipientDocument = recipientDataFactory.document();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestMergeRecipients }) => {
      const res = await requestMergeRecipients(recipientDataFactory.id(), [recipientDataFactory.id()]);
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
        test('should return forbidden', async ({ requestMergeRecipients }) => {
          const res = await requestMergeRecipients(recipientDataFactory.id(), [recipientDataFactory.id()]);
          recipientApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should merge recipients', async ({ requestMergeRecipients, saveRecipients, findRecipientById }) => {
          await saveRecipients(sourceRecipientDocument, targetRecipientDocument);

          const res = await requestMergeRecipients(getRecipientId(targetRecipientDocument), [getRecipientId(sourceRecipientDocument)]);
          recipientApiExpect(res).toBeNoContentResponse();

          recipientApiExpect(await findRecipientById(getRecipientId(sourceRecipientDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('should reassign recipient in related', () => {
          let accountDocument: Documents.Account;
          let loanAccountDocument: Documents.Account;

          test.beforeEach(async () => {
            accountDocument = accountDataFactory.document();
            loanAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });
          });

          test('payment transaction', async ({ requestMergeRecipients, saveAccounts, saveTransactions, findTransactionById, saveRecipients, findRecipientById }) => {

            const paymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
              recipient: sourceRecipientDocument,
            });
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveRecipients(
              sourceRecipientDocument,
              targetRecipientDocument,
            );
            await saveTransactions(paymentTransactionDocument);

            const res = await requestMergeRecipients(getRecipientId(targetRecipientDocument), [getRecipientId(sourceRecipientDocument)]);
            recipientApiExpect(res).toBeNoContentResponse();

            recipientApiExpect(await findRecipientById(getRecipientId(sourceRecipientDocument))).toHaveBeenDeletedFromDatabase();

            transactionApiExpect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await findTransactionById(getTransactionId(paymentTransactionDocument)), {
              recipient: {
                from: getRecipientId(sourceRecipientDocument),
                to: getRecipientId(targetRecipientDocument),
              },
            });
          });

          test('loan transaction', async ({ requestMergeRecipients, saveAccounts, saveTransactions, findTransactionById, saveRecipients, findRecipientById }) => {

            const loanTransactionDocument = loanTransactionDataFactory.document({
              account: accountDocument,
              recipient: sourceRecipientDocument,
              loanAccount: loanAccountDocument,
            });
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveRecipients(
              sourceRecipientDocument,
              targetRecipientDocument,
            );
            await saveTransactions(loanTransactionDocument);

            const res = await requestMergeRecipients(getRecipientId(targetRecipientDocument), [getRecipientId(sourceRecipientDocument)]);
            recipientApiExpect(res).toBeNoContentResponse();

            recipientApiExpect(await findRecipientById(getRecipientId(sourceRecipientDocument))).toHaveBeenDeletedFromDatabase();

            transactionApiExpect(loanTransactionDocument).toHaveRelatedDocumentsChangedInLoanTransaction(await findTransactionById(getTransactionId(loanTransactionDocument)), {
              recipient: {
                from: getRecipientId(sourceRecipientDocument),
                to: getRecipientId(targetRecipientDocument),
              },
            });
          });

          test('repayment transaction', async ({ requestMergeRecipients, saveAccounts, saveTransactions, findTransactionById, saveRecipients, findRecipientById }) => {
            const repaymentTransactionDocument = loanTransactionDataFactory.document({
              account: loanAccountDocument,
              recipient: sourceRecipientDocument,
              loanAccount: accountDocument,
            });
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveRecipients(
              sourceRecipientDocument,
              targetRecipientDocument,
            );
            await saveTransactions(repaymentTransactionDocument);

            const res = await requestMergeRecipients(getRecipientId(targetRecipientDocument), [getRecipientId(sourceRecipientDocument)]);
            recipientApiExpect(res).toBeNoContentResponse();

            recipientApiExpect(await findRecipientById(getRecipientId(sourceRecipientDocument))).toHaveBeenDeletedFromDatabase();

            transactionApiExpect(repaymentTransactionDocument).toHaveRelatedDocumentsChangedInLoanTransaction(await findTransactionById(getTransactionId(repaymentTransactionDocument)), {
              recipient: {
                from: getRecipientId(sourceRecipientDocument),
                to: getRecipientId(targetRecipientDocument),
              },
            });
          });

          test('split transaction', async ({ requestMergeRecipients, saveAccounts, saveTransactions, findTransactionById, saveRecipients, findRecipientById }) => {
            const splitTransactionDocument = splitTransactionDataFactory.document({
              account: accountDocument,
              recipient: sourceRecipientDocument,
            });
            await saveAccounts(accountDocument, loanAccountDocument);
            await saveRecipients(
              sourceRecipientDocument,
              targetRecipientDocument,
            );
            await saveTransactions(splitTransactionDocument);

            const res = await requestMergeRecipients(getRecipientId(targetRecipientDocument), [getRecipientId(sourceRecipientDocument)]);
            recipientApiExpect(res).toBeNoContentResponse();

            recipientApiExpect(await findRecipientById(getRecipientId(sourceRecipientDocument))).toHaveBeenDeletedFromDatabase();

            transactionApiExpect(splitTransactionDocument).toHaveRelatedDocumentsChangedInSplitTransaction(await findTransactionById(getTransactionId(splitTransactionDocument)), {
              recipient: {
                from: getRecipientId(sourceRecipientDocument),
                to: getRecipientId(targetRecipientDocument),
              },
            });
          });
        });

        test.describe('should return error', () => {
          test('if a source recipient does not exist', async ({ requestMergeRecipients, saveRecipients }) => {
            await saveRecipients(targetRecipientDocument, sourceRecipientDocument);

            const res = await requestMergeRecipients(getRecipientId(targetRecipientDocument), [
              getRecipientId(sourceRecipientDocument),
              recipientDataFactory.id(),
            ]);
            recipientApiExpect(res).toBeBadRequestResponse();
            recipientApiExpect(res).toHaveMessage('Some of the recipients are not found');
          });

          test.describe('if body', () => {
            test('is not array', async ({ requestMergeRecipients }) => {
              const res = await requestMergeRecipients(recipientDataFactory.id(), {} as any);
              recipientApiExpect(res).toBeBadRequestResponse();
              recipientApiExpect(res).toHaveWrongTypeValidationError('body', 'data', 'array');
            });

            test('has too few items', async ({ requestMergeRecipients }) => {
              const res = await requestMergeRecipients(recipientDataFactory.id(), []);
              recipientApiExpect(res).toBeBadRequestResponse();
              recipientApiExpect(res).toHaveTooFewItemsValidationError('body', 'data', 1);
            });
          });

          test.describe('if body[0]', () => {
            test('is not string', async ({ requestMergeRecipients }) => {
              const res = await requestMergeRecipients(recipientDataFactory.id(), [1] as any);
              recipientApiExpect(res).toBeBadRequestResponse();
              recipientApiExpect(res).toHaveWrongTypeValidationError('body', 'data/0', 'string');
            });

            test('is not a valid mongo id', async ({ requestMergeRecipients }) => {
              const res = await requestMergeRecipients(recipientDataFactory.id(), [recipientDataFactory.id('not-valid')]);
              recipientApiExpect(res).toBeBadRequestResponse();
              recipientApiExpect(res).toHavePatternValidationError('body', 'data/0');
            });
          });

          test.describe('if recipientId', () => {
            test('is not mongo id', async ({ requestMergeRecipients }) => {
              const res = await requestMergeRecipients(recipientDataFactory.id('not-mongo-id'), [recipientDataFactory.id()]);

              recipientApiExpect(res).toBeBadRequestResponse();
              recipientApiExpect(res).toHavePatternValidationError('pathParameters', 'recipientId');
            });

            test('does not belong to any recipient', async ({ requestMergeRecipients }) => {
              const res = await requestMergeRecipients(recipientDataFactory.id(), [getRecipientId(sourceRecipientDocument)]);
              recipientApiExpect(res).toBeBadRequestResponse();
              recipientApiExpect(res).toHaveMessage('Some of the recipients are not found');
            });
          });
        });
      }
    });
  }
});
