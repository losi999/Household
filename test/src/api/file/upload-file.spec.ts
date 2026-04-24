import { File } from '@household/shared/types/types';
import { fileDataFactory } from '@household/test/api/file/data-factory';
import { default as schema } from '@household/test/schemas/file-url-response';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';

import { test as fileApiTest, expect as fileApiExpect } from '@household/test/fixtures/file-api.fixture';
import { test as storageTest } from '@household/test/fixtures/storage.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects, mergeTests } from '@playwright/test';
import { test as fileDbTest } from '@household/test/fixtures/file-db.fixture';

const expect = mergeExpects(fileApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

const test = mergeTests(fileApiTest, fileDbTest, storageTest);

test.describe('POST /file/v1/files', () => {
  let request: File.Request;

  test.beforeEach(async () => {
    request = fileDataFactory.request();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreateUploadUrl }) => {
      const res = await requestCreateUploadUrl(request);
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
        test('should return forbidden', async ({ requestCreateUploadUrl }) => {
          const res = await requestCreateUploadUrl(request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should upload file', () => {
          test('with complete body', async ({ requestCreateUploadUrl, requestUploadFile, findFileById, checkFile }) => {
            const urlRes = await requestCreateUploadUrl(request);
            expect(urlRes).toBeOkResponse();
            expect(urlRes).toMatchSchema(schema);

            const { fileId, url } = (await urlRes.json()) as File.FileId & File.Url;
            expect(request).toHaveBeenSavedAsFileDocument(await findFileById(fileId));
            
            await requestUploadFile(url);
            const file = await checkFile(fileId);
            expect(file).toHaveBeenStoredInS3();
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateUploadUrl }) => {
              const res = await requestCreateUploadUrl({
                ...request,
                extraProperty: 'extra',
              } as any);
  
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if fileType', () => {
            test('is missing from body', async ({ requestCreateUploadUrl }) => {
              const res = await requestCreateUploadUrl(fileDataFactory.request({
                fileType: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'fileType');
            });

            test('is not string', async ({ requestCreateUploadUrl }) => {
              const res = await requestCreateUploadUrl(fileDataFactory.request({
                fileType: 1 as any, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'fileType', 'string');
            });

            test('is not a valid enum value', async ({ requestCreateUploadUrl }) => {
              const res = await requestCreateUploadUrl(fileDataFactory.request({
                fileType: 'not-enum' as any, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveEnumValidationError('body', 'fileType');
            });
          });

          test.describe('if timezone', () => {
            test('is missing from body', async ({ requestCreateUploadUrl }) => {
              const res = await requestCreateUploadUrl(fileDataFactory.request({
                timezone: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'timezone');
            });

            test('is not string', async ({ requestCreateUploadUrl }) => {
              const res = await requestCreateUploadUrl(fileDataFactory.request({
                timezone: 1 as any, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'timezone', 'string');
            });

            test('is too short', async ({ requestCreateUploadUrl }) => {
              const res = await requestCreateUploadUrl(fileDataFactory.request({
                timezone: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'timezone', 1);
            });
          });
        });
      }
    });
  });
});
