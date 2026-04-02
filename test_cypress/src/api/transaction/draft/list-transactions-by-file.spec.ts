import { default as schema } from '@household/test/api/schemas/transaction-response-list';
import { Account, File, Transaction } from '@household/shared/types/types';
import { fileDataFactory } from '../../file/data-factory';
import { draftTransactionDataFactory } from '@household/test/api/transaction/draft/draft-data-factory';
import { addSeconds, entries, getFileId } from '@household/shared/common/utils';
import { createFileId } from '@household/shared/common/test-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { accountDataFactory } from '@household/test/api/account/data-factory';
import { allowUsers } from '@household/test/api/utils';
import { AccountType } from '@household/shared/enums';
import { splitTransactionDataFactory } from '@household/test/api/transaction/split/split-data-factory';
import { transferTransactionDataFactory } from '@household/test/api/transaction/transfer/transfer-data-factory';
import { reimbursementTransactionDataFactory } from '@household/test/api/transaction/reimbursement/reimbursement-data-factory';
import { deferredTransactionDataFactory } from '@household/test/api/transaction/deferred/deferred-data-factory';

const permissionMap = allowUsers('editor') ;

describe('GET /transaction/v1/files/{fileId}/transactions', () => {
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

  beforeEach(() => {
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

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.authenticate('anonymous')
        .requestGetTransactionListByFile(getFileId(fileDocument))
        .expectUnauthorizedResponse();
    });
  });

  entries(permissionMap).forEach(([
    userType,
    isAllowed,
  ]) => {
    describe(`called as ${userType}`, () => {
      if (!isAllowed) {
        it('should return forbidden', () => {
          cy.authenticate(userType)
            .requestGetTransactionListByFile(getFileId(fileDocument))
            .expectForbiddenResponse();
        });
      } else {
        it('should get a list of draft transactions', () => {
          cy.saveTransactionDocuments([
            draftDocument,
            duplicatedDraftDocument,
            duplicatePaymentDocument,
            duplicateInvertedPaymentDocument,
            duplicateSplitDocument,
            duplicateTransferDocument,
            duplicateInvertedTransferDocument,
            duplicateDeferredDocument,
            duplicateReimbursementDocument,
          ])
            .saveAccountDocuments([
              accountDocument,
              loanAccountDocument,
            ])
            .authenticate(userType)
            .requestGetTransactionListByFile(getFileId(fileDocument))
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateTransactionDraftListResponse(
              {
                document: draftDocument,
              },
              {
                document: duplicatedDraftDocument,
                duplicateTransactions: [
                  duplicatePaymentDocument,
                  duplicateInvertedPaymentDocument,
                  duplicateSplitDocument,
                  duplicateTransferDocument,
                  duplicateInvertedTransferDocument,
                  duplicateDeferredDocument,
                  duplicateReimbursementDocument,
                ],
              });
        });

        describe('should return error', () => {
          describe('if fileId', () => {
            it('is not mongo id', () => {
              cy.authenticate(userType)
                .requestGetTransactionListByFile(createFileId('not-mongo-id'))
                .expectBadRequestResponse()
                .expectWrongPropertyPattern('fileId', 'pathParameters');
            });
          });
        });
      }
    });
  });
});
