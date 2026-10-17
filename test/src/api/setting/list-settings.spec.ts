import { responseList as schema } from '@household/shared/schemas/setting';
import { Requests } from '@household/shared/types/requests';
import { settingDataFactory } from '@household/test/api/setting/data-factory';
import { forbidUsers } from '@household/test/utils';
import { entries } from '@household/shared/common/utils';
import { SettingKey } from '@household/shared/enums';
import { settingApiTest, settingApiExpect } from '@household/test/fixtures/setting-api.fixture';
import { mergeTests } from '@playwright/test';
import { settingDbTest } from '@household/test/fixtures/setting-db.fixture';

const permissionMap = forbidUsers();

const test = mergeTests(settingApiTest, settingDbTest);

test.describe('GET /setting/v1/settings', () => {
  let settingKey1: SettingKey;
  let settingKey2: SettingKey;
  let settingRequest2: Requests.Setting;
  let settingRequest1: Requests.Setting;

  test.beforeEach(async () => {
    settingKey1 = settingDataFactory.key();
    settingKey2 = settingDataFactory.key();
    settingRequest1 = settingDataFactory.request();
    settingRequest2 = settingDataFactory.request();
  });

  test.describe('called as anonymous', () => {
    test('should return unauthorized', async ({ requestListSettings }) => {
      const res = await requestListSettings();
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
        test('should return forbidden', async ({ requestListSettings }) => {
          const res = await requestListSettings();
          settingApiExpect(res).toBeForbiddenResponse();
        });
      } else {
        test('should get a list of settings', async ({ requestListSettings, updateSetting }) => {
          await updateSetting(settingKey1, settingDataFactory.update(settingRequest1));
          await updateSetting(settingKey2, settingDataFactory.update(settingRequest2));
          const res = await requestListSettings();
          settingApiExpect(res).toBeOkResponse();
          settingApiExpect(res).toMatchSchema(schema);

          settingApiExpect(res).toContainMatchingSettingDocument(settingDataFactory.document(settingKey1, settingRequest1));
          settingApiExpect(res).toContainMatchingSettingDocument(settingDataFactory.document(settingKey2, settingRequest2));
        });
      }
    });
  });
});
