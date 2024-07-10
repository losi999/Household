import { default as schema } from '@household/shared/schemas/recipient-id';
import { Recipient } from '@household/shared/types/types';
import { createRecipientId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Recipient id schema', () => {
  const tester = jsonSchemaTesterFactory<Recipient.RecipientId>(schema);

  tester.validateSuccess({
    recipientId: createRecipientId(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        recipientId: createRecipientId(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.recipientId', () => {
      tester.required({
        recipientId: undefined,
      }, 'recipientId');

      tester.type({
        recipientId: 1 as any,
      }, 'recipientId', 'string');

      tester.pattern({
        recipientId: createRecipientId('not-valid'),
      }, 'recipientId');
    });
  });
});
