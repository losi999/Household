import { entries, getRecipientId, getTransactionId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { test, expect as recipientApiExpect } from '@household/test/fixtures/recipient-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { recipientDataFactory } from '@household/test/api/recipient/data-factory';
import { recipientService } from '@household/test/dependencies';
import { Account, Recipient, Transaction } from '@household/shared/types/types';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { AccountType } from '@household/shared/enums';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transactionService } from '@household/test/dependencies';
import { accountService } from '@household/test/dependencies';
import { mergeExpects } from '@playwright/test';

const expect = mergeExpects(apiExpect, recipientApiExpect, transactionApiExpect);

const permissionMap = allowUsers('editor');

test.describe('POST /recipient/v1/recipients/{recipientId}/merge', () => {

  let sourceRecipientDocument: Recipient.Document;
  let targetRecipientDocument: Recipient.Document;

  test.beforeEach(async () => {
    sourceRecipientDocument = recipientDataFactory.document();
    targetRecipientDocument = recipientDataFactory.document();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestMergeRecipients }) => {
      const res = await requestMergeRecipients(recipientDataFactory.id(), [recipientDataFactory.id()]);
      expect(res).toBeUnauthorizedResponse();
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
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should merge recipients', async ({ requestMergeRecipients }) => {
          await recipientService.saveRecipients(sourceRecipientDocument, targetRecipientDocument);

          const res = await requestMergeRecipients(getRecipientId(targetRecipientDocument), [getRecipientId(sourceRecipientDocument)]);
          expect(res).toBeCreatedResponse();

          expect(await recipientService.findRecipientById(getRecipientId(sourceRecipientDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('in related transactions source recipient', () => {
          let unrelatedRecipientDocument: Recipient.Document;
          let paymentTransactionDocument: Transaction.PaymentDocument;
          let deferredTransactionDocument: Transaction.DeferredDocument;
          let reimbursementTransactionDocument: Transaction.ReimbursementDocument;
          let splitTransactionDocument: Transaction.SplitDocument;
          let unrelatedPaymentTransactionDocument: Transaction.PaymentDocument;
          let unrelatedDeferredTransactionDocument: Transaction.DeferredDocument;
          let unrelatedReimbursementTransactionDocument: Transaction.ReimbursementDocument;
          let unrelatedSplitTransactionDocument: Transaction.SplitDocument;
          let accountDocument: Account.Document;
          let loanAccountDocument: Account.Document;

          test.beforeEach(async () => {
            accountDocument = accountDataFactory.document();
            loanAccountDocument = accountDataFactory.document({
              accountType: AccountType.Loan,
            });

            unrelatedRecipientDocument = recipientDataFactory.document();

            paymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
              recipient: sourceRecipientDocument,
            });

            deferredTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              recipient: sourceRecipientDocument,
              loanAccount: loanAccountDocument,
            });

            reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
              account: loanAccountDocument,
              recipient: sourceRecipientDocument,
              loanAccount: accountDocument,
            });

            unrelatedPaymentTransactionDocument = paymentTransactionDataFactory.document({
              account: accountDocument,
              recipient: unrelatedRecipientDocument,
            });

            unrelatedDeferredTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              recipient: unrelatedRecipientDocument,
              loanAccount: loanAccountDocument,
            });

            unrelatedReimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
              account: loanAccountDocument,
              recipient: unrelatedRecipientDocument,
              loanAccount: accountDocument,
            });

            splitTransactionDocument = splitTransactionDataFactory.document({
              account: accountDocument,
              recipient: sourceRecipientDocument,
            });

            unrelatedSplitTransactionDocument = splitTransactionDataFactory.document({
              account: accountDocument,
              recipient: unrelatedRecipientDocument,
            });
          });

          test('should be replaced if recipient is merged into another recipient', async ({ requestMergeRecipients }) => {
            await accountService.saveAccounts(accountDocument, loanAccountDocument);
            await recipientService.saveRecipients(
              sourceRecipientDocument,
              targetRecipientDocument,
              unrelatedRecipientDocument,
            );
            await transactionService.saveTransactions(
              paymentTransactionDocument,
              deferredTransactionDocument,
              reimbursementTransactionDocument,
              unrelatedPaymentTransactionDocument,
              unrelatedDeferredTransactionDocument,
              unrelatedReimbursementTransactionDocument,
              splitTransactionDocument,
              unrelatedSplitTransactionDocument,
            );

            const res = await requestMergeRecipients(getRecipientId(targetRecipientDocument), [getRecipientId(sourceRecipientDocument)]);
            expect(res).toBeCreatedResponse();

            expect(await recipientService.findRecipientById(getRecipientId(sourceRecipientDocument))).toHaveBeenDeletedFromDatabase();

            expect(paymentTransactionDocument).toChangeRelatedDocumentsChangedInPaymentTransaction(await transactionService.findTransactionById(getTransactionId(paymentTransactionDocument)), {
              recipient: {
                from: getRecipientId(sourceRecipientDocument),
                to: getRecipientId(targetRecipientDocument),
              },
            });
            expect(deferredTransactionDocument).toChangeRelatedDocumentsChangedInDeferredTransaction(await transactionService.findTransactionById(getTransactionId(deferredTransactionDocument)), {
              recipient: {
                from: getRecipientId(sourceRecipientDocument),
                to: getRecipientId(targetRecipientDocument),
              },
            });
            expect(reimbursementTransactionDocument).toChangeRelatedDocumentsChangedInReimbursementTransaction(await transactionService.findTransactionById(getTransactionId(reimbursementTransactionDocument)), {
              recipient: {
                from: getRecipientId(sourceRecipientDocument),
                to: getRecipientId(targetRecipientDocument),
              },
            });
            expect(unrelatedPaymentTransactionDocument).toChangeRelatedDocumentsChangedInPaymentTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedPaymentTransactionDocument)), {
              recipient: {
                from: getRecipientId(sourceRecipientDocument),
                to: getRecipientId(targetRecipientDocument),
              },
            });
            expect(unrelatedDeferredTransactionDocument).toChangeRelatedDocumentsChangedInDeferredTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedDeferredTransactionDocument)), {
              recipient: {
                from: getRecipientId(sourceRecipientDocument),
                to: getRecipientId(targetRecipientDocument),
              },
            });
            expect(unrelatedReimbursementTransactionDocument).toChangeRelatedDocumentsChangedInReimbursementTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedReimbursementTransactionDocument)), {
              recipient: {
                from: getRecipientId(sourceRecipientDocument),
                to: getRecipientId(targetRecipientDocument),
              },
            });
            expect(splitTransactionDocument).toChangeRelatedDocumentsChangedInSplitTransaction(await transactionService.findTransactionById(getTransactionId(splitTransactionDocument)), {
              recipient: {
                from: getRecipientId(sourceRecipientDocument),
                to: getRecipientId(targetRecipientDocument),
              },
            });
            expect(unrelatedSplitTransactionDocument).toChangeRelatedDocumentsChangedInSplitTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedSplitTransactionDocument)), {
              recipient: {
                from: getRecipientId(sourceRecipientDocument),
                to: getRecipientId(targetRecipientDocument),
              },
            });
          });
        });

        test.describe('should return error', () => {
          test('if a source recipient does not exist', async ({ requestMergeRecipients }) => {
            await recipientService.saveRecipients(targetRecipientDocument, sourceRecipientDocument);

            const res = await requestMergeRecipients(getRecipientId(targetRecipientDocument), [
              getRecipientId(sourceRecipientDocument),
              recipientDataFactory.id(),
            ]);
            expect(res).toBeBadRequestResponse();
            expect(res).toHaveMessage('Some of the recipients are not found');
          });

          test.describe('if body', () => {
            test('is not array', async ({ requestMergeRecipients }) => {
              const res = await requestMergeRecipients(recipientDataFactory.id(), {} as any);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'data', 'array');
            });

            test('has too few items', async ({ requestMergeRecipients }) => {
              const res = await requestMergeRecipients(recipientDataFactory.id(), []);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooFewItemsValidationError('body', 'data', 1);
            });
          });

          test.describe('if body[0]', () => {
            test('is not string', async ({ requestMergeRecipients }) => {
              const res = await requestMergeRecipients(recipientDataFactory.id(), [1] as any);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'data/0', 'string');
            });

            test('is not a valid mongo id', async ({ requestMergeRecipients }) => {
              const res = await requestMergeRecipients(recipientDataFactory.id(), [recipientDataFactory.id('not-valid')]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('body', 'data/0');
            });
          });

          test.describe('if recipientId', () => {
            test('is not mongo id', async ({ requestMergeRecipients }) => {
              const res = await requestMergeRecipients(recipientDataFactory.id('not-mongo-id'), [recipientDataFactory.id()]);

              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'recipientId');
            });

            test('does not belong to any recipient', async ({ requestMergeRecipients }) => {
              const res = await requestMergeRecipients(recipientDataFactory.id(), [getRecipientId(sourceRecipientDocument)]);
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveMessage('Some of the recipients are not found');
            });
          });
        });
      }
    });
  }
});
