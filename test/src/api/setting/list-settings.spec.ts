import { default as schema } from '@household/test/schemas/setting-response-list';
import { Setting } from '@household/shared/types/types';
import { settingDataFactory } from '@household/test/api/setting/data-factory';
import { forbidUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';
import { SettingKey } from '@household/shared/enums';
import { test, expect as settingApiExpect } from '@household/test/fixtures/setting-api.fixture';
import { expect as apiExpect } from '@household/test/fixtures/api.fixture';
import { mergeExpects } from '@playwright/test';
import { settingService } from '@household/test/dependencies';

const expect = mergeExpects(settingApiExpect, apiExpect);

const permissionMap = forbidUsers();

test.describe('GET /setting/v1/settings', () => {
  let settingKey1: SettingKey;
  let settingKey2: SettingKey;
  let settingRequest2: Setting.Request;
  let settingRequest1: Setting.Request;

  test.beforeEach(async () => {
    settingKey1 = settingDataFactory.key();
    settingKey2 = settingDataFactory.key();
    settingRequest1 = settingDataFactory.request();
    settingRequest2 = settingDataFactory.request();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestListSettings }) => {
      const res = await requestListSettings();
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
        test('should return forbidden', async ({ requestListSettings }) => {
          const res = await requestListSettings();
          expect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of settings', async ({ requestListSettings }) => {
          await settingService.updateSetting(settingKey1, settingDataFactory.update(settingRequest1));
          await settingService.updateSetting(settingKey2, settingDataFactory.update(settingRequest2));
          const res = await requestListSettings();
          expect(res).toBeOkResponse();
          expect(res).toMatchSchema(schema);

          expect(res).toContainMatchingSettingDocument(settingDataFactory.document(settingKey1, settingRequest1));
          expect(res).toContainMatchingSettingDocument(settingDataFactory.document(settingKey2, settingRequest2));
        });
      }
    });
  });
});
