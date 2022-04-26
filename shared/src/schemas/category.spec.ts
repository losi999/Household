import { default as schema } from '@household/shared/schemas/category';
import { validateSchemaAdditionalProperties, validateSchemaMinLength, validateSchemaPattern, validateSchemaRequired, validateSchemaType } from '@household/shared/common/unit-testing';
import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { Category } from '@household/shared/types/types';
import { createCategoryId } from '@household/shared/common/test-data-factory';

describe('Category schema', () => {
  let data: Category.Request;

  beforeEach(() => {
    data = {
      name: 'name',
      parentCategoryId: createCategoryId('62378f3a6add840bbd4c630c'),
    };
  });

  describe('should accept', () => {
    it('complete body', () => {
      const result = validatorService.validate(data, schema);
      expect(result).toBeUndefined();
    });

    describe('without optional property', () => {
      it('parentCategoryId', () => {
        delete data.parentCategoryId;
        const result = validatorService.validate(data, schema);
        expect(result).toBeUndefined();
      });
    });
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

    describe('if data.parentCategoryId', () => {
      it('is not string', () => {
        (data.parentCategoryId as any) = 2;
        const result = validatorService.validate(data, schema);
        validateSchemaType(result, 'parentCategoryId', 'string');
      });

      it('does not match pattern', () => {
        data.parentCategoryId = createCategoryId();
        const result = validatorService.validate(data, schema);
        validateSchemaPattern(result, 'parentCategoryId');
      });
    });
  });
});
