import { default as schema } from '@household/test/api/schemas/transaction-response-list';
import { File, Transaction } from '@household/shared/types/types';
import { fileDataFactory } from '../../file/data-factory';
import { draftTransactionDataFactory } from '@household/test/api/transaction/draft/draft-data-factory';
import { addSeconds, getFileId } from '@household/shared/common/utils';
import { createFileId } from '@household/shared/common/test-data-factory';
import { paymentTransactionDataFactory } from '@household/test/api/transaction/payment/payment-data-factory';
import { accountDataFactory } from '@household/test/api/account/data-factory';

describe('GET /transaction/v1/files/{fileId}/transactions', () => {
  let fileDocument: File.Document;
  let draftDocument: Transaction.DraftDocument;
  let duplicateDraftDocument: Transaction.DraftDocument;
  let duplicatePaymentDocument: Transaction.PaymentDocument;

  beforeEach(() => {
    fileDocument = fileDataFactory.document();
    draftDocument = draftTransactionDataFactory.document({
      file: fileDocument,
    });
    duplicateDraftDocument = draftTransactionDataFactory.document({
      file: fileDocument,
    });
    duplicatePaymentDocument = paymentTransactionDataFactory.document({
      body: {
        amount: duplicateDraftDocument.amount,
        issuedAt: addSeconds(3600, duplicateDraftDocument.issuedAt).toISOString(),
      },
      account: accountDataFactory.document(),
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestGetTransactionListByFile(getFileId(fileDocument))
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get a list of draft transactions', () => {
      cy.saveTransactionDocuments([
        draftDocument,
        duplicateDraftDocument,
        duplicatePaymentDocument,
      ])
        .authenticate(1)
        .requestGetTransactionListByFile(getFileId(fileDocument))
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateTransactionDraftListResponse(
          {
            document: draftDocument,
          },
          {
            document: duplicateDraftDocument,
            duplicateTransaction: duplicatePaymentDocument,
          });
    });

    describe('should return error', () => {
      describe('if fileId', () => {
        it('is not mongo id', () => {
          cy.authenticate(1)
            .requestGetTransactionListByFile(createFileId('not-mongo-id'))
            .expectBadRequestResponse()
            .expectWrongPropertyPattern('fileId', 'pathParameters');
        });
      });
    });
  });
});
