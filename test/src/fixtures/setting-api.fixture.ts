import { headerExpiresIn } from '@household/shared/constants';
import { SettingKey } from '@household/shared/enums';
import { Setting } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { APIResponse } from '@playwright/test';

type SettingApiFixture = {
  requestUpdateSetting(settingKey: SettingKey, setting: Setting.Request): Promise<APIResponse>;
  requestListSettings(): Promise<APIResponse>;
};

export const test = baseTest.extend<SettingApiFixture>({
  requestUpdateSetting: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateSetting = async (settingKey: SettingKey, setting: Setting.Request) => {
      return request.post(`${process.env.BASE_URL}/setting/v1/settings/${settingKey}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: setting,
      });
    };

    await use(requestUpdateSetting);
  },
  requestListSettings: async ({ authenticate, request, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListSettings = async () => {
      return request.get(`${process.env.BASE_URL}/setting/v1/settings`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListSettings);
  },
});

export const expect = baseExpect.extend({});
