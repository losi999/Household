import { default as schema } from '@household/shared/schemas/setting-key';
import { Setting } from '@household/shared/types/types';
import { createSettingKey } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Setting id schema', () => {
  const tester = jsonSchemaTesterFactory<Setting.SettingKey>(schema);

  tester.validateSuccess({
    settingKey: createSettingKey(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        settingKey: createSettingKey(),
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
