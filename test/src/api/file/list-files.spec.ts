import { default as schema } from '@household/test/api/schemas/file-response-list';
import { File, Transaction } from '@household/shared/types/types';
import { fileDataFactory } from './data-factory';
import { draftTransactionDataFactory } from '@household/test/api/transaction/draft/draft-data-factory';

describe('GET /file/v1/files', () => {
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
        .requestGetFileList()
        .expectUnauthorizedResponse();
    });
  });

  describe('called as an admin', () => {
    it('should get a list of files', () => {
      cy.saveFileDocument(fileDocument)
        .saveTransactionDocument(draftDocument)
        .authenticate(1)
        .requestGetFileList()
        .expectOkResponse()
        .expectValidResponseSchema(schema)
        .validateFileListResponse([draftDocument]);
    });
  });
});
