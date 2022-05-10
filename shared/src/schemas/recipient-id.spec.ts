import { default as schema } from '@household/shared/schemas/recipient-id';
import { Recipient } from '@household/shared/types/types';
import { createRecipientId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Recipient id schema', () => {
  let data: Recipient.Id;
  const tester = jsonSchemaTesterFactory<Recipient.Id>(schema);

  beforeEach(() => {
    data = {
      recipientId: createRecipientId('62378f3a6add840bbd4c630c'),
    };
  });

  it('should accept valid body', () => {
    tester.validateSuccess(data);
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        tester.validateSchemaAdditionalProperties(data, 'data');
      });
    });

    describe('if data.recipientId', () => {
      it('is missing', () => {
        data.recipientId = undefined;
        tester.validateSchemaRequired(data, 'recipientId');
      });

      it('does not match pattern', () => {
        data.recipientId = createRecipientId();
        tester.validateSchemaPattern(data, 'recipientId');
      });
    });
  });
});
