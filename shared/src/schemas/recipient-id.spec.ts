import { recipientId as schema } from '@household/shared/schemas/recipient';
import { Api } from '@household/shared/types/api';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Recipient id schema', () => {
  const tester = schemaTesterFactory<Api.Recipient.RecipientId>(schema);

  tester.validateSuccess({
    recipientId: testDataFactory.recipient.id(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        recipientId: testDataFactory.recipient.id(),
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
        recipientId: testDataFactory.recipient.id('not-valid'),
      }, 'recipientId');
    });
  });
});
