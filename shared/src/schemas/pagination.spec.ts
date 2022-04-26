import { default as schema } from '@household/shared/schemas/pagination';
import { validateSchemaAdditionalProperties, validateSchemaPattern, validateSchemaRequired } from '@household/shared/common/unit-testing';
import { validatorService } from '@household/shared/dependencies/services/validator-service';

describe('Pagination schema', () => {
  let data: {
    pageSize: string;
    pageNumber: string;
  };

  beforeEach(() => {
    data = {
      pageNumber: '1',
      pageSize: '23',
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

    describe('if data.pageNumber', () => {
      it('is missing', () => {
        data.pageNumber = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'pageNumber');
      });

      it('does not match pattern', () => {
        data.pageNumber = 'asd';
        const result = validatorService.validate(data, schema);
        validateSchemaPattern(result, 'pageNumber');
      });
    });

    describe('if data.pageSize', () => {
      it('is missing', () => {
        data.pageSize = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'pageSize');
      });

      it('does not match pattern', () => {
        data.pageSize = 'asd';
        const result = validatorService.validate(data, schema);
        validateSchemaPattern(result, 'pageSize');
      });
    });
  });
});
