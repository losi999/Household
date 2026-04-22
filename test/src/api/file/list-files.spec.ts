import { default as schema } from '@household/test/schemas/file-response-list';
import { File, Transaction } from '@household/shared/types/types';
import { fileDataFactory } from '@household/test/api/file/data-factory';
import { draftTransactionDataFactory } from '@household/test/api/transaction/draft/draft-data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';

import { test as fileApiTest, expect as fileApiExpect } from '@household/test/fixtures/file-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { test as fileDbTest } from '@household/test/fixtures/file-db.fixture';

const expect = mergeExpects(fileApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

const test = mergeTests(fileApiTest, transactionDbTest, fileDbTest);

test.describe('GET /file/v1/files', () => {
  let fileDocument: File.Document;
  let draftDocument: Transaction.DraftDocument;

  test.beforeEach(async () => {
    fileDocument = fileDataFactory.document();
    draftDocument = draftTransactionDataFactory.document({
      file: fileDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestListFiles }) => {
      const res = await requestListFiles();
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
        test('should return forbidden', async ({ requestListFiles }) => {
          const res = await requestListFiles();
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of files', async ({ requestListFiles, saveTransaction, saveFile }) => {
          await saveFile(fileDocument);
          await saveTransaction(draftDocument);
          const res = await requestListFiles();
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);
          expect(res).toContainMatchingFileDocument(fileDocument, 1);
        });
      }
    });
  });
});
