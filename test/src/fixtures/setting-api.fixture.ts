import { headerExpiresIn } from '@household/shared/constants';
import { SettingKey } from '@household/shared/enums';
import { Setting } from '@household/shared/types/types';
import { test as baseTest, expect as baseExpect } from '@household/test/fixtures/api.fixture';
import { createComparer } from '@household/test/utils';
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

export const expect = baseExpect.extend({
  async toBeStoredInDatabase(req: Setting.Request, settingKey: SettingKey, document: Setting.Document) {
    if (!document) {
      return {
        pass: false,
        message: () => 'expected setting to be stored in database, but it was not found',
      };
    }
  
    const comparer = createComparer((compare) => {
      return {
        settingKey: compare(document.settingKey, settingKey),
        value: compare(document.value, req.value),
      };  
    });
  
    const message = comparer.validate(document, '_id', 'createdAt', 'expiresAt', 'updatedAt');
  
    return {
      pass: !message,
      message: () => message,
    };
  },
  async toMatchSettingDocumentInList(received: APIResponse, document: Setting.Document) {
    const response = await received.json() as Setting.Response[];
  
    const matchingResponse = response.find(r => r.settingKey === document.settingKey);
  
    if (!matchingResponse) {
      return {
        pass: false,
        message: () => `expected response to contain a setting with id ${document.settingKey}, but it was not found`,
      };
    }

    const comparer = createComparer((compare) => {
      return {
        settingKey: compare(matchingResponse.settingKey, document.settingKey),
        value: compare(matchingResponse.value, document.value),
      };
    });
  
    const message = comparer.validate(matchingResponse);
  
    return {
      pass: !message,
      message: () => message,
    };
  }, 

});
