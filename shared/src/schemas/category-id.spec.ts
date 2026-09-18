import { categoryId as schema } from '@household/shared/schemas/category';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Api } from '@household/shared/types/api';

describe('Category id schema', () => {
  const tester = schemaTesterFactory<Api.Category.CategoryId>(schema);

  tester.validateSuccess({
    categoryId: testDataFactory.category.id(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        categoryId: testDataFactory.category.id(),
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
        categoryId: testDataFactory.category.id('not-valid'),
      }, 'categoryId');
    });
  });
});
