// @ts-nocheck
import { default as schema } from '@household/test/schemas/transaction-response-list';
import { Account, File, Transaction } from '@household/shared/types/types';
import { fileDataFactory } from '../../file/data-factory';
import { draftTransactionDataFactory } from '@household/test/api/transaction/draft/draft-data-factory';
import { addSeconds, entries, getFileId } from '@household/shared/common/utils';
import { createFileId } from '@household/shared/common/test-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { allowUsers } from '@household/test/utils';
import { AccountType } from '@household/shared/enums';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';

import { test as transactionApiTest, expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as accountDbTest } from '@household/test/fixtures/account-db.fixture';
import { test as transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';

const expect = mergeExpects(transactionApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

const test = mergeTests(transactionApiTest, accountDbTest, transactionDbTest);

test.describe('GET /transaction/v1/files/{fileId}/transactions', () => {
  let fileDocument: File.Document;
  let accountDocument: Account.Document;
  let loanAccountDocument: Account.Document;
  let draftDocument: Transaction.DraftDocument;
  let duplicatedDraftDocument: Transaction.DraftDocument;
  let duplicatePaymentDocument: Transaction.PaymentDocument;
  let duplicateInvertedPaymentDocument: Transaction.PaymentDocument;
  let duplicateSplitDocument: Transaction.SplitDocument;
  let duplicateTransferDocument: Transaction.TransferDocument;
  let duplicateInvertedTransferDocument: Transaction.TransferDocument;
  let duplicateDeferredDocument: Transaction.DeferredDocument;
  let duplicateReimbursementDocument: Transaction.ReimbursementDocument;

  test.beforeEach(async () => {
    fileDocument = fileDataFactory.document();
    accountDocument = accountDataFactory.document();
    loanAccountDocument = accountDataFactory.document({
      accountType: AccountType.Loan,
    });
    draftDocument = draftTransactionDataFactory.document({
      file: fileDocument,
    });
    duplicatedDraftDocument = draftTransactionDataFactory.document({
      file: fileDocument,
    });
    duplicatePaymentDocument = paymentTransactionDataFactory.document({
      body: {
        amount: duplicatedDraftDocument.amount,
        issuedAt: addSeconds(3600, duplicatedDraftDocument.issuedAt).toISOString(),
      },
      account: accountDocument,
    });
    duplicateInvertedPaymentDocument = paymentTransactionDataFactory.document({
      body: {
        amount: duplicatedDraftDocument.amount * -1,
        issuedAt: addSeconds(3600, duplicatedDraftDocument.issuedAt).toISOString(),
      },
      account: accountDocument,
    });
    duplicateSplitDocument = splitTransactionDataFactory.document({
      body: {
        amount: duplicatedDraftDocument.amount,
        issuedAt: addSeconds(3600, duplicatedDraftDocument.issuedAt).toISOString(),
      },
      account: accountDocument,
    });
    duplicateTransferDocument = transferTransactionDataFactory.document({
      body: {
        amount: duplicatedDraftDocument.amount,
        transferAmount: duplicatedDraftDocument.amount * -1,
        issuedAt: addSeconds(3600, duplicatedDraftDocument.issuedAt).toISOString(),
      },
      account: accountDocument,
      transferAccount: loanAccountDocument,
    });
    duplicateInvertedTransferDocument = transferTransactionDataFactory.document({
      body: {
        amount: duplicatedDraftDocument.amount,
        transferAmount: duplicatedDraftDocument.amount * -1,
        issuedAt: addSeconds(3600, duplicatedDraftDocument.issuedAt).toISOString(),
      },
      account: accountDocument,
      transferAccount: loanAccountDocument,
    });
    duplicateDeferredDocument = deferredTransactionDataFactory.document({
      body: {
        amount: duplicatedDraftDocument.amount,
        issuedAt: addSeconds(3600, duplicatedDraftDocument.issuedAt).toISOString(),
      },
      account: accountDocument,
      loanAccount: loanAccountDocument,
    });
    duplicateReimbursementDocument = reimbursementTransactionDataFactory.document({
      body: {
        amount: duplicatedDraftDocument.amount,
        issuedAt: addSeconds(3600, duplicatedDraftDocument.issuedAt).toISOString(),
      },
      account: loanAccountDocument,
      loanAccount: accountDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestGetTransactionListByFile }) => {
      const res = await requestGetTransactionListByFile(getFileId(fileDocument));
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
        test('should return forbidden', async ({ requestGetTransactionListByFile }) => {
          const res = await requestGetTransactionListByFile(getFileId(fileDocument));
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of draft transactions', async ({ requestGetTransactionListByFile, saveAccounts, saveTransactions }) => {
          await saveTransactions(draftDocument, duplicatedDraftDocument, duplicatePaymentDocument, duplicateInvertedPaymentDocument, duplicateSplitDocument, duplicateTransferDocument, duplicateInvertedTransferDocument, duplicateDeferredDocument, duplicateReimbursementDocument);
          await saveAccounts(accountDocument, loanAccountDocument);
          const res = await requestGetTransactionListByFile(getFileId(fileDocument));
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);

          expect(res).toContainMatchingDraftTransactionDocument(draftDocument);
          expect(res).toContainMatchingDraftTransactionDocument(duplicatedDraftDocument, duplicatePaymentDocument, duplicateInvertedPaymentDocument, duplicateSplitDocument, duplicateTransferDocument, duplicateInvertedTransferDocument, duplicateDeferredDocument, duplicateReimbursementDocument);
        });

        test.describe('should return error', () => {
          test.describe('if fileId', () => {
            test('is not mongo id', async ({ requestGetTransactionListByFile }) => {
              const res = await requestGetTransactionListByFile(createFileId('not-mongo-id'));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'fileId');
            });
          });
        });
      }
    });
  });
});
