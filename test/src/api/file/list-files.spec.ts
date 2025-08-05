import { default as schema } from '@household/test/api/schemas/file-response-list';
import { File, Transaction } from '@household/shared/types/types';
import { fileDataFactory } from './data-factory';
import { draftTransactionDataFactory } from '@household/test/api/transaction/draft/draft-data-factory';
import { allowUsers } from '@household/test/api/utils';
import { entries } from '@household/shared/common/utils';

const permissionMap = allowUsers('editor') ;

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
      cy.authenticate('anonymous')
        .requestGetFileList()
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
            .requestGetFileList()
            .expectForbiddenResponse();
        });
      } else {
        it('should get a list of files', () => {
          cy.saveFileDocument(fileDocument)
            .saveTransactionDocument(draftDocument)
            .authenticate(userType)
            .requestGetFileList()
            .expectOkResponse()
            .expectValidResponseSchema(schema)
            .validateFileListResponse([draftDocument]);
        });
      }
    });
  });
});
