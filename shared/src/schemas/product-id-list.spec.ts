import { default as schema } from '@household/shared/schemas/product-id-list';
import { Product } from '@household/shared/types/types';
import { createProductId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Product id list schema', () => {
  const tester = jsonSchemaTesterFactory<Product.Id[]>(schema);

  tester.validateSuccess([createProductId()]);

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaType(0 as any, 'data', 'array');

      tester.validateSchemaMinItems([], 'data', 1);
    });

    describe('if data[0]', () => {
      tester.validateSchemaType([1 as any], 'data/0', 'string');

      tester.validateSchemaPattern([createProductId('not-valid')], 'data/0');
    });
  });
});
