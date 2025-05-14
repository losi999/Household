import { default as schema } from '@household/test/api/schemas/file-response-list';
import { File, Transaction } from '@household/shared/types/types';
import { fileDataFactory } from './data-factory';
import { draftTransactionDataFactory } from '@household/test/api/transaction/draft/draft-data-factory';
import { UserType } from '@household/shared/enums';

const allowedUserTypes = [UserType.Editor];

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

  Object.values(UserType).forEach((userType) => {
    describe(`called as ${userType}`, () => {
      if (!allowedUserTypes.includes(userType)) {
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
