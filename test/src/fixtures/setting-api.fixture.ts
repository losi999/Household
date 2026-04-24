import { headerExpiresIn } from '@household/shared/constants';
import { SettingKey } from '@household/shared/enums';
import { Setting } from '@household/shared/types/types';
import { Comparer } from '@household/test/comparer';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { APIResponse } from '@playwright/test';

type SettingApiFixture = {
  requestUpdateSetting(settingKey: SettingKey, setting: Setting.Request): Promise<APIResponse>;
  requestListSettings(): Promise<APIResponse>;
};

export const test = baseTest.extend<SettingApiFixture>({
  requestUpdateSetting: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestUpdateSetting = async (settingKey: SettingKey, setting: Setting.Request) => {
      return loggedRequest.post(`${process.env.BASE_URL}/setting/v1/settings/${settingKey}`, {
        headers: {
          Authorization: authToken,
          [headerExpiresIn]: process.env.EXPIRES_IN,
        },
        data: setting,
      });
    };

    await use(requestUpdateSetting);
  },
  requestListSettings: async ({ authenticate, loggedRequest, userType }, use) => {
    const authToken = userType ? await authenticate(userType) : undefined;

    const requestListSettings = async () => {
      return loggedRequest.get(`${process.env.BASE_URL}/setting/v1/settings`, {
        headers: {
          Authorization: authToken,
        },
      });
    };

    await use(requestListSettings);
  },
});

export const expect = baseExpect.extend({
  async toHaveBeenSavedAsSettingDocument(req: Setting.Request, settingKey: SettingKey, document: Setting.Document) {
    if (!document) {
      return {
        pass: false,
        message: () => 'Expected setting to be stored in database, but it was not found',
      };
    }
  
    const comparer = new Comparer(document, {
      settingKey: settingKey,
      value: req.value,
    }, '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected setting to be stored in database, but it was not:\n${errors.join('\n')}`,
    };
  },
  async toContainMatchingSettingDocument(received: APIResponse, document: Setting.Document) {
    const response = await received.json() as Setting.Response[];
  
    const matchingResponse = response.find(r => r.settingKey === document.settingKey);
  
    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `Expected response to contain a setting with id ${document.settingKey}, but it was not found`,
      };
    }

    const comparer = new Comparer(matchingResponse, {
      settingKey: document.settingKey,
      value: document.value,
    });
  
    const errors = comparer.validate();
  
    return {
      pass: errors.length === 0,
      message: () => `Expected response to match setting document, but it did not:\n${errors.join('\n')}`,
    };
  }, 

});
