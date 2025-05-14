import { File, Transaction } from '@household/shared/types/types';
import { fileDataFactory } from './data-factory';
import { draftTransactionDataFactory } from '@household/test/api/transaction/draft/draft-data-factory';
import { getFileId, getTransactionId } from '@household/shared/common/utils';
import { UserType } from '@household/shared/enums';

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
      cy.authenticate('anonymous')
        .requestDeleteFile(fileDataFactory.id())
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an editor', () => {
    it('should delete file', () => {
      cy.saveFileDocument(fileDocument)
        .saveTransactionDocument(draftDocument)
        .writeFileToS3(getFileId(fileDocument), 'file', '')
        .authenticate(UserType.Editor)
        .requestDeleteFile(getFileId(fileDocument))
        .expectNoContentResponse()
        .validateFileDeleted(getFileId(fileDocument))
        .validateTransactionDeleted(getTransactionId(draftDocument))
        .validateFileDeletedFromS3(getFileId(fileDocument));

    });
  });

  describe('should return error', () => {
    describe('if fileId', () => {
      it('is not mongo id', () => {
        cy.authenticate(UserType.Editor)
          .requestDeleteFile(fileDataFactory.id('not-valid'))
          .expectBadRequestResponse()
          .expectWrongPropertyPattern('fileId', 'pathParameters');
      });
    });
  });
});
