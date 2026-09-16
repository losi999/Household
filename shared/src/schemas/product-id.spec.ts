import { productId as schema } from '@household/shared/schemas/product';
import { createProductId } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Api } from '@household/shared/types/api';

describe('Product id schema', () => {
  const tester = schemaTesterFactory<Api.Product.ProductId>(schema);

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
