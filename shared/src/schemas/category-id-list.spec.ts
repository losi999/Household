import { default as schema } from '@household/shared/schemas/category-id-list';
import { Category } from '@household/shared/types/types';
import { createCategoryId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Category id list schema', () => {
  const tester = jsonSchemaTesterFactory<Category.Id[]>(schema);

  tester.validateSuccess([createCategoryId()]);

  describe('should deny', () => {
    describe('if data', () => {
      tester.type(0 as any, 'data', 'array');

      tester.minItems([], 'data', 1);
    });

    describe('if data[0]', () => {
      tester.type([1 as any], 'data/0', 'string');

      tester.pattern([createCategoryId('not-valid')], 'data/0');
    });
  });
});
