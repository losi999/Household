import { Requests } from '@household/shared/types/requests';
import { settingDataFactory } from '@household/test/api/setting/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';
import { SettingKey } from '@household/shared/enums';

import { settingApiTest, settingApiExpect } from '@household/test/fixtures/setting-api.fixture';
import { mergeTests } from '@playwright/test';
import { settingDbTest } from '@household/test/fixtures/setting-db.fixture';

const permissionMap = allowUsers('editor') ;

const test = mergeTests(settingApiTest, settingDbTest);

test.describe('POST /setting/v1/settings/{settingKey}', () => {
  let request: Requests.Setting;
  let settingKey: SettingKey;

  test.beforeEach(async () => {
    request = settingDataFactory.request();
    settingKey = settingDataFactory.key();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdateSetting }) => {
      const res = await requestUpdateSetting(settingKey, request);
      settingApiExpect(res).toBeUnauthorizedResponse();
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
        test('should return forbidden', async ({ requestUpdateSetting }) => {
          const res = await requestUpdateSetting(settingKey, request);
          settingApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should update setting', () => {
          test('with complete body', async ({ requestUpdateSetting, getSettingByKey }) => {
            const res = await requestUpdateSetting(settingKey, request);
            settingApiExpect(res).toBeNoContentResponse();

            settingApiExpect(request).toHaveBeenSavedAsSettingDocument(settingKey, await getSettingByKey(settingKey));
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateSetting }) => {
              const res = await requestUpdateSetting(settingKey, {
                ...request,
                extraProperty: 'extra',
              } as any);
          
              settingApiExpect(res).toBeBadRequestResponse();
              settingApiExpect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
          test.describe('if value', () => {
            test('is missing from body', async ({ requestUpdateSetting }) => {
              const res = await requestUpdateSetting(settingKey, settingDataFactory.request({
                value: undefined, 
              }));
              settingApiExpect(res).toBeBadRequestResponse();
              settingApiExpect(res).toHaveRequiredPropertyValidationError('body', 'value');
            });

            test('is not string', async ({ requestUpdateSetting }) => {
              const res = await requestUpdateSetting(settingKey, settingDataFactory.request({
                value: {} as any, 
              }));
              settingApiExpect(res).toBeBadRequestResponse();
              settingApiExpect(res).toHaveWrongTypeValidationError('body', 'value', 'string');
            });

            test('is not number', async ({ requestUpdateSetting }) => {
              const res = await requestUpdateSetting(settingKey, settingDataFactory.request({
                value: {} as any, 
              }));
              settingApiExpect(res).toBeBadRequestResponse();
              settingApiExpect(res).toHaveWrongTypeValidationError('body', 'value', 'number');
            });

            test('is not boolean', async ({ requestUpdateSetting }) => {
              const res = await requestUpdateSetting(settingKey, settingDataFactory.request({
                value: {} as any, 
              }));
              settingApiExpect(res).toBeBadRequestResponse();
              settingApiExpect(res).toHaveWrongTypeValidationError('body', 'value', 'boolean');
            });

            test('is too short', async ({ requestUpdateSetting }) => {
              const res = await requestUpdateSetting(settingKey, settingDataFactory.request({
                value: '', 
              }));
              settingApiExpect(res).toBeBadRequestResponse();
              settingApiExpect(res).toHaveTooShortValidationError('body', 'value', 1);
            });
          });
        });
      }
    });
  });
});
