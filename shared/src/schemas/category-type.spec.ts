import { default as schema } from '@household/shared/schemas/category-type';
import { Category } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Account id schema', () => {
  const tester = jsonSchemaTesterFactory<Category.CategoryType>(schema);

  tester.validateSuccess({
    categoryType: 'regular',
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        categoryType: 'regular',
        extra: 1,
      } as any, 'data');
    });

    describe('if data.categoryType', () => {
      tester.validateSchemaRequired({
        categoryType: undefined,
      }, 'categoryType');

      tester.validateSchemaType({
        categoryType: 1 as any,
      }, 'categoryType', 'string');

      tester.validateSchemaEnumValue({
        categoryType: 'not-valid' as any,
      }, 'categoryType');
    });
  });
});
