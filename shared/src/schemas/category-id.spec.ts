import { default as schema } from '@household/shared/schemas/category-id';
import { Category } from '@household/shared/types/types';
import { createCategoryId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Category id schema', () => {
  const tester = jsonSchemaTesterFactory<Category.CategoryId>(schema);

  tester.validateSuccess({
    categoryId: createCategoryId(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        categoryId: createCategoryId(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.categoryId', () => {
      tester.required({
        categoryId: undefined,
      }, 'categoryId');

      tester.type({
        categoryId: 1 as any,
      }, 'categoryId', 'string');

      tester.pattern({
        categoryId: createCategoryId('not-valid'),
      }, 'categoryId');
    });
  });
});
