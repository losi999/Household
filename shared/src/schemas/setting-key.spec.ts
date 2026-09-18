import { settingKey as schema } from '@household/shared/schemas/setting';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Api } from '@household/shared/types/api';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Setting key schema', () => {
  const tester = schemaTesterFactory<Api.Setting.SettingKey>(schema);

  tester.validateSuccess({
    settingKey: testDataFactory.setting.key(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        settingKey: testDataFactory.setting.key(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.settingKey', () => {
      tester.required({
        settingKey: undefined,
      }, 'settingKey');

      tester.type({
        settingKey: 1 as any,
      }, 'settingKey', 'string');
    });
  });
});
