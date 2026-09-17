import { request as schema } from '@household/shared/schemas/setting';
import { createSettingRequest } from '@household/shared/common/test-data-factory';
import { Requests } from '@household/shared/types/requests';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Setting schema', () => {
  const tester = schemaTesterFactory<Requests.Setting>(schema);
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
