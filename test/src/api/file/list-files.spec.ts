import { responseList as schema } from '@household/shared/schemas/file';
import { Documents } from '@household/shared/types/documents';
import { fileDataFactory } from '@household/test/api/file/data-factory';
import { draftTransactionDataFactory } from '@household/test/api/transaction/draft/draft-data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';

import { fileApiTest, fileApiExpect } from '@household/test/fixtures/file-api.fixture';
import { mergeTests } from '@playwright/test';
import { transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { fileDbTest } from '@household/test/fixtures/file-db.fixture';

const permissionMap = allowUsers('editor') ;

const test = mergeTests(fileApiTest, transactionDbTest, fileDbTest);

test.describe('GET /file/v1/files', () => {
  let fileDocument: Documents.File;
  let draftDocument: Documents.DraftTransaction;

  test.beforeEach(async () => {
    fileDocument = fileDataFactory.document();
    draftDocument = draftTransactionDataFactory.document({
      file: fileDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestListFiles }) => {
      const res = await requestListFiles();
      fileApiExpect(res).toBeUnauthorizedResponse();
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
        test('should return forbidden', async ({ requestListFiles }) => {
          const res = await requestListFiles();
          fileApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of files', async ({ requestListFiles, saveTransaction, saveFile }) => {
          await saveFile(fileDocument);
          await saveTransaction(draftDocument);
          const res = await requestListFiles();
          fileApiExpect(res).toBeOkResponse();
          fileApiExpect(res).toMatchSchema(schema);
          fileApiExpect(res).toContainMatchingFileDocument(fileDocument, 1);
        });
      }
    });
  });
});
