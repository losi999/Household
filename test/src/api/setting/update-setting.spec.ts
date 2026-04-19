import { Setting } from '@household/shared/types/types';
import { settingDataFactory } from '@household/test/api/setting/data-factory';
import { allowUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';
import { SettingKey } from '@household/shared/enums';

import { test, expect as settingApiExpect } from '@household/test/fixtures/setting-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { settingService } from '@household/test/dependencies';

const expect = mergeExpects(settingApiExpect, apiExpect);

const permissionMap = allowUsers('editor') ;

test.describe('POST /setting/v1/settings/{settingKey}', () => {
  let request: Setting.Request;
  let settingKey: SettingKey;

  test.beforeEach(async () => {
    request = settingDataFactory.request();
    settingKey = settingDataFactory.key();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestUpdateSetting }) => {
      const res = await requestUpdateSetting(settingKey, request);
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
        test('should return forbidden', async ({ requestUpdateSetting }) => {
          const res = await requestUpdateSetting(settingKey, request);
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test.describe('should update setting', () => {
          test('with complete body', async ({ requestUpdateSetting }) => {
            const res = await requestUpdateSetting(settingKey, request);
            expect(res).toBeNoContentResponse();

            expect(request).toBeStoredInDatabase(settingKey, await settingService.getSettingByKey(settingKey));
          });
        });

        test.describe('should return error', () => {
          test.describe('if body', () => {
            test('has additional properties', async ({ requestUpdateSetting }) => {
              const res = await requestUpdateSetting(settingKey, {
                ...request,
                extraProperty: 'extra',
              } as any);
          
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveAdditionalPropertiesValidationError('body', 'data', 'extraProperty');
            });
          });
          test.describe('if value', () => {
            test('is missing from body', async ({ requestUpdateSetting }) => {
              const res = await requestUpdateSetting(settingKey, settingDataFactory.request({
                value: undefined, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveRequiredPropertyValidationError('body', 'value');
            });

            test('is not string', async ({ requestUpdateSetting }) => {
              const res = await requestUpdateSetting(settingKey, settingDataFactory.request({
                value: {} as any, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'value', 'string');
            });

            test('is not number', async ({ requestUpdateSetting }) => {
              const res = await requestUpdateSetting(settingKey, settingDataFactory.request({
                value: {} as any, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'value', 'number');
            });

            test('is not boolean', async ({ requestUpdateSetting }) => {
              const res = await requestUpdateSetting(settingKey, settingDataFactory.request({
                value: {} as any, 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveWrongTypeValidationError('body', 'value', 'boolean');
            });

            test('is too short', async ({ requestUpdateSetting }) => {
              const res = await requestUpdateSetting(settingKey, settingDataFactory.request({
                value: '', 
              }));
              expect(res).toBeBadRequestResponse();
              expect(res).toHaveTooShortValidationError('body', 'value', 1);
            });
          });
        });
      }
    });
  });
});
