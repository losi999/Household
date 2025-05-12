import { File, Transaction } from '@household/shared/types/types';
import { fileDataFactory } from './data-factory';
import { draftTransactionDataFactory } from '@household/test/api/transaction/draft/draft-data-factory';
import { getFileId, getTransactionId } from '@household/shared/common/utils';

describe('DELETE /file/v1/files/{fileId}', () => {
  let fileDocument: File.Document;
  let draftDocument: Transaction.DraftDocument;

  beforeEach(() => {
    fileDocument = fileDataFactory.document();
    draftDocument = draftTransactionDataFactory.document({
      file: fileDocument,
    });
  });

  describe('called as anonymous', () => {
    it('should return unauthorized', () => {
      cy.unauthenticate()
        .requestDeleteFile(fileDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should delete file', () => {
      cy.saveFileDocument(fileDocument)
        .saveTransactionDocument(draftDocument)
        .writeFileToS3(getFileId(fileDocument), 'file', '')
        .authenticate(1)
        .requestDeleteFile(getFileId(fileDocument))
        .expectNoContentResponse()
        .validateFileDeleted(getFileId(fileDocument))
        .validateTransactionDeleted(getTransactionId(draftDocument))
        .validateFileDeletedFromS3(getFileId(fileDocument));

    });
  });
});
