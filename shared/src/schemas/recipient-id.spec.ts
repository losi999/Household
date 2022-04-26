import { default as schema } from '@household/shared/schemas/recipient-id';
import { validateSchemaAdditionalProperties, validateSchemaPattern, validateSchemaRequired } from '@household/shared/common/unit-testing';
import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { Recipient } from '@household/shared/types/types';
import { createRecipientId } from '@household/shared/common/test-data-factory';

describe('Recipient id schema', () => {
  let data: Recipient.Id;

  beforeEach(() => {
    data = {
      recipientId: createRecipientId('62378f3a6add840bbd4c630c'),
    };
  });

  it('should accept valid body', () => {
    const result = validatorService.validate(data, schema);
    expect(result).toBeUndefined();
  });

  describe('should deny', () => {
    describe('if data', () => {
      it('has additional property', () => {
        (data as any).extra = 'asd';
        const result = validatorService.validate(data, schema);
        validateSchemaAdditionalProperties(result, 'data');
      });
    });

    describe('if data.recipientId', () => {
      it('is missing', () => {
        data.recipientId = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'recipientId');
      });

      it('does not match pattern', () => {
        data.recipientId = createRecipientId();
        const result = validatorService.validate(data, schema);
        validateSchemaPattern(result, 'recipientId');
      });
    });
  });
});
