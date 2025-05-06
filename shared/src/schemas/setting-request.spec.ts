import { default as schema } from '@household/shared/schemas/setting-request';
import { Setting } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createSettingRequest } from '@household/shared/common/test-data-factory';

describe('Setting schema', () => {
  const tester = jsonSchemaTesterFactory<Setting.Request>(schema);
  describe('should accept', () => {
    tester.validateSuccess(createSettingRequest());
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createSettingRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.value', () => {
      tester.required(createSettingRequest({
        value: undefined,
      }), 'value');

      tester.type(createSettingRequest({
        value: {} as any,
      }), 'value', 'string,number,boolean');

      tester.minLength(createSettingRequest({
        value: '',
      }), 'value', 1);
    });
  });
});
