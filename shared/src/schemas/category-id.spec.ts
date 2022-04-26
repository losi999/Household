import { default as schema } from '@household/shared/schemas/category-id';
import { validateSchemaAdditionalProperties, validateSchemaPattern, validateSchemaRequired } from '@household/shared/common/unit-testing';
import { validatorService } from '@household/shared/dependencies/services/validator-service';
import { Category } from '@household/shared/types/types';
import { createCategoryId } from '@household/shared/common/test-data-factory';

describe('Category id schema', () => {
  let data: Category.Id;

  beforeEach(() => {
    data = {
      categoryId: createCategoryId('62378f3a6add840bbd4c630c'),
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

    describe('if data.categoryId', () => {
      it('is missing', () => {
        data.categoryId = undefined;
        const result = validatorService.validate(data, schema);
        validateSchemaRequired(result, 'categoryId');
      });

      it('does not match pattern', () => {
        data.categoryId = createCategoryId();
        const result = validatorService.validate(data, schema);
        validateSchemaPattern(result, 'categoryId');
      });
    });
  });
});
