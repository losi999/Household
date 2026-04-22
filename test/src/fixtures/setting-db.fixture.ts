import { SettingKey } from '@household/shared/enums';
import { ISettingService } from '@household/shared/services/setting-service';
import { settingServiceFactory } from '@household/shared/services/setting-service';
import { mongoDbService } from '@household/test/dependencies';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

const settingService = settingServiceFactory(mongoDbService);

export const test = baseTest.extend<Pick<ISettingService, 'updateSetting' | 'getSettingByKey'>>({
  updateSetting: async ({ logDbCall }, use) => {
    const updateSetting: ISettingService['updateSetting'] = async (key, updateQuery) => {
      const result = await settingService.updateSetting(key, updateQuery);
      await logDbCall('updateSetting', {
        key,
        updateQuery,
      }, result);
      return result;
    };

    await use(updateSetting);
  },
  getSettingByKey: async ({ logDbCall }, use) => {
    const getSettingByKey: ISettingService['getSettingByKey'] = async <V extends string | number | boolean>(settingKey: SettingKey) => {
      const result = await settingService.getSettingByKey<V>(settingKey);
      await logDbCall('getSettingByKey', {
        settingKey,
      }, result);
      return result;
    };

    await use(getSettingByKey);
  },
});
