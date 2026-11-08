import { Requests } from '@household/shared/types/requests';
import { Api } from '@household/shared/types/api';
import { fileDataFactory } from '@household/test/api/file/data-factory';
import { uploadUrl as schema } from '@household/shared/schemas/file';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';

import { fileApiTest, fileApiExpect } from '@household/test/fixtures/file-api.fixture';
import { storageTest } from '@household/test/fixtures/storage.fixture';
import { mergeTests } from '@playwright/test';
import { fileDbTest } from '@household/test/fixtures/file-db.fixture';

const permissionMap = allowUsers('editor') ;

const test = mergeTests(fileApiTest, fileDbTest, storageTest);

test.describe('POST /file/v1/files', () => {
  let request: Requests.File;

  test.beforeEach(async () => {
    request = fileDataFactory.request();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestCreateUploadUrl }) => {
      const res = await requestCreateUploadUrl(request);
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
        test('should return forbidden', async ({ requestCreateUploadUrl }) => {
          const res = await requestCreateUploadUrl(request);
          fileApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should upload file', () => {
          test('with complete body', async ({ requestCreateUploadUrl, requestUploadFile, findFileById, checkFile }) => {
            const urlRes = await requestCreateUploadUrl(request);
            fileApiExpect(urlRes).toBeCreatedResponse();
            fileApiExpect(urlRes).toMatchSchema(schema);

            const { fileId, url } = (await urlRes.json()) as Api.File.FileId & Api.File.Url;
            fileApiExpect(request).toHaveBeenSavedAsFileDocument(await findFileById(fileId));
            
            await requestUploadFile(url);
            const file = await checkFile(fileId);
            fileApiExpect(file).toHaveBeenStoredInS3();
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestCreateUploadUrl }) => {
              const res = await requestCreateUploadUrl({
                ...request,
                extraProperty: 'extra',
              } as any);
  
              fileApiExpect(res).toBeBadRequestResponse();
              fileApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });

          test.describe('if fileType', () => {
            test('is missing from body', async ({ requestCreateUploadUrl }) => {
              const res = await requestCreateUploadUrl(fileDataFactory.request({
                fileType: undefined, 
              }));
              fileApiExpect(res).toBeBadRequestResponse();
              fileApiExpect(res).toHaveRequiredPropertyValidationError('body', 'fileType');
            });

            test('is not string', async ({ requestCreateUploadUrl }) => {
              const res = await requestCreateUploadUrl(fileDataFactory.request({
                fileType: 1 as any, 
              }));
              fileApiExpect(res).toBeBadRequestResponse();
              fileApiExpect(res).toHaveWrongTypeValidationError('body', 'fileType', 'string');
            });

            test('is not a valid enum value', async ({ requestCreateUploadUrl }) => {
              const res = await requestCreateUploadUrl(fileDataFactory.request({
                fileType: 'not-enum' as any, 
              }));
              fileApiExpect(res).toBeBadRequestResponse();
              fileApiExpect(res).toHaveEnumValidationError('body', 'fileType');
            });
          });

          test.describe('if timezone', () => {
            test('is missing from body', async ({ requestCreateUploadUrl }) => {
              const res = await requestCreateUploadUrl(fileDataFactory.request({
                timezone: undefined, 
              }));
              fileApiExpect(res).toBeBadRequestResponse();
              fileApiExpect(res).toHaveRequiredPropertyValidationError('body', 'timezone');
            });

            test('is not string', async ({ requestCreateUploadUrl }) => {
              const res = await requestCreateUploadUrl(fileDataFactory.request({
                timezone: 1 as any, 
              }));
              fileApiExpect(res).toBeBadRequestResponse();
              fileApiExpect(res).toHaveWrongTypeValidationError('body', 'timezone', 'string');
            });

            test('is too short', async ({ requestCreateUploadUrl }) => {
              const res = await requestCreateUploadUrl(fileDataFactory.request({
                timezone: '', 
              }));
              fileApiExpect(res).toBeBadRequestResponse();
              fileApiExpect(res).toHaveTooShortValidationError('body', 'timezone', 1);
            });
          });
        });
      }
    });
  });
});
