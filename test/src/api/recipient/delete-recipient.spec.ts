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

test.describe('DELETE /recipient/v1/recipients/{recipientId}', () => {

  let recipientDocument: Recipient.Document;

  test.beforeEach(async () => {
    recipientDocument = recipientDataFactory.document();
  });

  test.describe('called as anyonymous', () => {
    test('should return unauthorized', async ({ requestDeleteRecipient }) => {
      const res = await requestDeleteRecipient(recipientDataFactory.id());
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
        test('should return forbidden', async ({ requestDeleteRecipient }) => {
          const res = await requestDeleteRecipient(recipientDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete recipient', async ({ requestDeleteRecipient }) => {
          await recipientService.saveRecipient(recipientDocument);

          const res = await requestDeleteRecipient(getRecipientId(recipientDocument));
          expect(res).toBeNoContentResponse();

          expect(await recipientService.findRecipientById(getRecipientId(recipientDocument))).toHaveBeenDeletedFromDatabase();
        });

        test.describe('in related transactions recipient', () => {
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
              recipient: recipientDocument,
            });

            deferredTransactionDocument = deferredTransactionDataFactory.document({
              account: accountDocument,
              recipient: recipientDocument,
              loanAccount: loanAccountDocument,
            });

            reimbursementTransactionDocument = reimbursementTransactionDataFactory.document({
              account: loanAccountDocument,
              recipient: recipientDocument,
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
              recipient: recipientDocument,
            });

            unrelatedSplitTransactionDocument = splitTransactionDataFactory.document({
              account: accountDocument,
              recipient: recipientDocument,
            });
          });

          test('should be unset if recipient is deleted', async ({ requestDeleteRecipient }) => {
            await accountService.saveAccounts(accountDocument, loanAccountDocument);
            await recipientService.saveRecipients(recipientDocument, unrelatedRecipientDocument);
            await transactionService.saveTransactions(
              paymentTransactionDocument,
              splitTransactionDocument,
              deferredTransactionDocument,
              reimbursementTransactionDocument,
              unrelatedPaymentTransactionDocument,
              unrelatedDeferredTransactionDocument,
              unrelatedReimbursementTransactionDocument,
              unrelatedSplitTransactionDocument,
            );

            const res = await requestDeleteRecipient(getRecipientId(recipientDocument));
            expect(res).toBeNoContentResponse();

            expect(await recipientService.findRecipientById(getRecipientId(recipientDocument))).toHaveBeenDeletedFromDatabase();

            expect(paymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await transactionService.findTransactionById(getTransactionId(paymentTransactionDocument)), {
              recipient: {
                from: getRecipientId(recipientDocument),
              },
            });
            expect(deferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await transactionService.findTransactionById(getTransactionId(deferredTransactionDocument)), {
              recipient: {
                from: getRecipientId(recipientDocument),
              },
            });
            expect(reimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await transactionService.findTransactionById(getTransactionId(reimbursementTransactionDocument)), {
              recipient: {
                from: getRecipientId(recipientDocument),
              },
            });
            expect(unrelatedPaymentTransactionDocument).toHaveRelatedDocumentsChangedInPaymentTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedPaymentTransactionDocument)), {
              recipient: {
                from: getRecipientId(recipientDocument),
              },
            });
            expect(unrelatedDeferredTransactionDocument).toHaveRelatedDocumentsChangedInDeferredTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedDeferredTransactionDocument)), {
              recipient: {
                from: getRecipientId(recipientDocument),
              },
            });
            expect(unrelatedReimbursementTransactionDocument).toHaveRelatedDocumentsChangedInReimbursementTransaction(await transactionService.findTransactionById(getTransactionId(unrelatedReimbursementTransactionDocument)), {
              recipient: {
                from: getRecipientId(recipientDocument),
              },
            });
            expect(splitTransactionDocument).toHaveRelatedDocumentsChangedInSplitTransaction(await transactionService.findTransactionById(getTransactionId(splitTransactionDocument)), {
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

              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'recipientId');
            });
          });
        });
      }
    });
  }
});
