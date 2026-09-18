import { request as schema } from '@household/shared/schemas/setting';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Requests } from '@household/shared/types/requests';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Setting schema', () => {
  const tester = schemaTesterFactory<Requests.Setting>(schema);
  describe('should accept', () => {
    tester.validateSuccess(testDataFactory.setting.request());
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.setting.request(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.value', () => {
      tester.required(testDataFactory.setting.request({
        value: undefined,
      }), 'value');

      tester.type(testDataFactory.setting.request({
        value: {} as any,
      }), 'value', 'string,number,boolean');

      tester.minLength(testDataFactory.setting.request({
        value: '',
      }), 'value', 1);
    });
  });
});
