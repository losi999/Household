import { default as schema } from '@household/shared/schemas/product-id';
import { Product } from '@household/shared/types/types';
import { createProductId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Product id schema', () => {
  const tester = jsonSchemaTesterFactory<Product.ProductId>(schema);

  tester.validateSuccess({
    productId: createProductId(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        productId: createProductId(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.productId', () => {
      tester.required({
        productId: undefined,
      }, 'productId');

      tester.type({
        productId: 1 as any,
      }, 'productId', 'string');

      tester.pattern({
        productId: createProductId('not-valid'),
      }, 'productId');
    });
  });
});
