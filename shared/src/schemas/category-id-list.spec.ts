import { idList as schema } from '@household/shared/schemas/category';
import { createCategoryId } from '@household/shared/common/test-data-factory';
import { Api } from '@household/shared/types/api';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Category id list schema', () => {
  const tester = schemaTesterFactory<Api.Category.Id[]>(schema);

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
