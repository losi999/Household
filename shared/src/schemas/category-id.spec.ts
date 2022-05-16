import { default as schema } from '@household/shared/schemas/category-id';
import { Category } from '@household/shared/types/types';
import { createCategoryId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Category id schema', () => {
  let data: Category.Id;
  const tester = jsonSchemaTesterFactory<Category.Id>(schema);

  beforeEach(() => {
    data = {
      categoryId: createCategoryId('62378f3a6add840bbd4c630c'),
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

    describe('if data.categoryId', () => {
      it('is missing', () => {
        data.categoryId = undefined;
        tester.validateSchemaRequired(data, 'categoryId');
      });

      it('does not match pattern', () => {
        data.categoryId = createCategoryId();
        tester.validateSchemaPattern(data, 'categoryId');
      });
    });
  });
});
