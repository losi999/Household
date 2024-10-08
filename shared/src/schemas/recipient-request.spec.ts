import { default as schema } from '@household/shared/schemas/recipient-request';
import { Recipient } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createRecipientRequest } from '@household/shared/common/test-data-factory';

describe('Recipient schema', () => {
  const tester = jsonSchemaTesterFactory<Recipient.Request>(schema);
  tester.validateSuccess(createRecipientRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createRecipientRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(createRecipientRequest({
        name: undefined,
      }), 'name');

      tester.type(createRecipientRequest({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(createRecipientRequest({
        name: '',
      }), 'name', 1);
    });
  });
});
