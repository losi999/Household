import { default as schema } from '@household/shared/schemas/recipient';
import { Recipient } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Recipient schema', () => {
  let data: Recipient.Request;
  const tester = jsonSchemaTesterFactory<Recipient.Request>(schema);

  beforeEach(() => {
    data = {
      name: 'name',
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

    describe('if data.name', () => {
      it('is missing', () => {
        data.name = undefined;
        tester.validateSchemaRequired(data, 'name');
      });

      it('is not string', () => {
        (data.name as any) = 2;
        tester.validateSchemaType(data, 'name', 'string');
      });

      it('is too short', () => {
        data.name = '';
        tester.validateSchemaMinLength(data, 'name', 1);
      });
    });
  });
});
