import { default as schema } from '@household/shared/schemas/recipient-id-list';
import { Recipient } from '@household/shared/types/types';
import { createRecipientId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Recipient id list schema', () => {
  const tester = jsonSchemaTesterFactory<Recipient.Id[]>(schema);

  tester.validateSuccess([createRecipientId()]);

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaType(0 as any, 'data', 'array');

      tester.validateSchemaMinItems([], 'data', 1);
    });

    describe('if data[0]', () => {
      tester.validateSchemaType([1 as any], 'data/0', 'string');

      tester.validateSchemaPattern([createRecipientId('not-valid')], 'data/0');
    });
  });
});
