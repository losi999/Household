import { default as schema } from '@household/shared/schemas/recipient';
import { validateSchemaAdditionalProperties, validateSchemaMinLength, validateSchemaRequired, validateSchemaType } from '@household/shared/common/unit-testing';
import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { Recipient } from '@household/shared/types/types';

describe('Recipient schema', () => {
  let data: Recipient.Request;

  beforeEach(() => {
    data = {
      name: 'name',
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

    describe('if data.name', () => {
      it('is missing', () => {
        data.name = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'name');
      });

      it('is not string', () => {
        (data.name as any) = 2;
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'name', 'string');
      });

      it('is too short', () => {
        data.name = '';
        const result = validatorService.validate(data, schema);
        validateSchemaMinLength(result, 'name', 1);
      });
    });
  });
});
