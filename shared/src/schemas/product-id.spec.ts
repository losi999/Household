import { productId as schema } from '@household/shared/schemas/product';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Api } from '@household/shared/types/api';

describe('Product id schema', () => {
  const tester = schemaTesterFactory<Api.Product.ProductId>(schema);

  tester.validateSuccess({
    productId: testDataFactory.product.id(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        productId: testDataFactory.product.id(),
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
        productId: testDataFactory.product.id('not-valid'),
      }, 'productId');
    });
  });
});
