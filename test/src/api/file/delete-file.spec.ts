import { Documents } from '@household/shared/types/documents';
import { fileDataFactory } from '@household/test/api/file/data-factory';
import { draftTransactionDataFactory } from '@household/test/api/transaction/draft/draft-data-factory';
import { entries, getFileId, getTransactionId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { fileApiTest, fileApiExpect } from '@household/test/fixtures/file-api.fixture';
import { transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { storageTest } from '@household/test/fixtures/storage.fixture';
import { mergeTests } from '@playwright/test';
import { transactionDbTest } from '@household/test/fixtures/transaction-db.fixture';
import { fileDbTest } from '@household/test/fixtures/file-db.fixture';

const permissionMap = allowUsers('editor') ;

const test = mergeTests(fileApiTest, transactionDbTest, fileDbTest, storageTest);  

test.describe('DELETE /file/v1/files/{fileId}', () => {
  let fileDocument: Documents.File;
  let draftDocument: Documents.DraftTransaction;

  test.beforeEach(async () => {
    fileDocument = fileDataFactory.document();
    draftDocument = draftTransactionDataFactory.document({
      file: fileDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteFile }) => {
      const res = await requestDeleteFile(fileDataFactory.id());
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
        test('should return forbidden', async ({ requestDeleteFile }) => {
          const res = await requestDeleteFile(fileDataFactory.id());
          fileApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete file', async ({ requestDeleteFile, saveTransaction, findTransactionById, saveFile, findFileById, writeFile, checkFile }) => {
          await saveFile(fileDocument);
          await saveTransaction(draftDocument);
          await writeFile(getFileId(fileDocument), 'file', '');
          const res = await requestDeleteFile(getFileId(fileDocument));
          fileApiExpect(res).toBeNoContentResponse();

          fileApiExpect(await findFileById(getFileId(fileDocument))).toHaveBeenDeletedFromDatabase();
          transactionApiExpect(await findTransactionById(getTransactionId(draftDocument))).toHaveBeenDeletedFromDatabase();
          fileApiExpect(await checkFile(getFileId(fileDocument))).toHaveBeenDeletedFromS3();

        });

        test.describe('should return error', () => {
          test.describe('if fileId', () => {
            test('is not mongo id', async ({ requestDeleteFile }) => {
              const res = await requestDeleteFile(fileDataFactory.id('not-valid'));
              fileApiExpect(res).toBeBadRequestResponse();
              fileApiExpect(res).toHavePatternValidationError('pathParameters', 'fileId');
            });
          });
        });
      }
    });
  });
});
