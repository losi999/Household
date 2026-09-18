import { request as schema } from '@household/shared/schemas/recipient';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Recipient schema', () => {
  const tester = schemaTesterFactory<Requests.Recipient>(schema);
  tester.validateSuccess(testDataFactory.recipient.request());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.recipient.request(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(testDataFactory.recipient.request({
        name: undefined,
      }), 'name');

      tester.type(testDataFactory.recipient.request({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(testDataFactory.recipient.request({
        name: '',
      }), 'name', 1);
    });
  });
});
