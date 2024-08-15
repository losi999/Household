import { default as schema } from '@household/shared/schemas/category-type';
import { Category } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Category type schema', () => {
  const tester = jsonSchemaTesterFactory<Category.CategoryType>(schema);

  tester.validateSuccess({
    categoryType: 'regular',
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        categoryType: 'regular',
        extra: 1,
      } as any, 'data');
    });

    describe('if data.categoryType', () => {
      tester.required({
        categoryType: undefined,
      }, 'categoryType');

      tester.type({
        categoryType: 1 as any,
      }, 'categoryType', 'string');

      tester.enum({
        categoryType: 'not-valid' as any,
      }, 'categoryType');
    });
  });
});
