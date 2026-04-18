import { File, Transaction } from '@household/shared/types/types';
import { fileDataFactory } from '@household/test/api/file/data-factory';
import { draftTransactionDataFactory } from '@household/test/api/transaction/draft/draft-data-factory';
import { entries, getFileId, getTransactionId } from '@household/shared/common/utils';
import { allowUsers } from '@household/test/utils';
import { test, expect as fileApiExpect } from '@household/test/fixtures/file-api.fixture';
import { expect as transactionApiExpect } from '@household/test/fixtures/transaction-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { fileService, storageService, transactionService } from '@household/test/dependencies';

const expect = mergeExpects(fileApiExpect, transactionApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

test.describe('DELETE /file/v1/files/{fileId}', () => {
  let fileDocument: File.Document;
  let draftDocument: Transaction.DraftDocument;

  test.beforeEach(async () => {
    fileDocument = fileDataFactory.document();
    draftDocument = draftTransactionDataFactory.document({
      file: fileDocument,
    });
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestDeleteFile }) => {
      const res = await requestDeleteFile(fileDataFactory.id());
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
        test('should return forbidden', async ({ requestDeleteFile }) => {
          const res = await requestDeleteFile(fileDataFactory.id());
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should delete file', async ({ requestDeleteFile }) => {
          await fileService.saveFile(fileDocument);
          await transactionService.saveTransaction(draftDocument);
          await storageService.writeFile(getFileId(fileDocument), 'file', '');
          const res = await requestDeleteFile(getFileId(fileDocument));
          expect(res).toBeNoContentResponse();

          expect(await fileService.findFileById(getFileId(fileDocument))).toHaveBeenDeletedFromDatabase();
          expect(await transactionService.findTransactionById(getTransactionId(draftDocument))).toHaveBeenDeletedFromDatabase();
          expect(await storageService.checkFile(getFileId(fileDocument))).toHaveBeenDeletedFromS3();

        });

        test.describe('should return error', () => {
          test.describe('if fileId', () => {
            test('is not mongo id', async ({ requestDeleteFile }) => {
              const res = await requestDeleteFile(fileDataFactory.id('not-valid'));
              expect(res).toBeBadRequestResponse();
              expect(res).toHavePatternValidationError('pathParameters', 'fileId');
            });
          });
        });
      }
    });
  });
});
