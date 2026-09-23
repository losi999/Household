import { priceId as schema } from '@household/shared/schemas/price';
import { Api } from '@household/shared/types/api';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Price id schema', () => {
  const tester = schemaTesterFactory<Api.Price.PriceId>(schema);

  tester.validateSuccess({
    priceId: testDataFactory.price.id(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        priceId: testDataFactory.price.id(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.priceId', () => {
      tester.required({
        priceId: undefined,
      }, 'priceId');

      tester.type({
        priceId: 1 as any,
      }, 'priceId', 'string');

      tester.pattern({
        priceId: testDataFactory.price.id('not-valid'),
      }, 'priceId');
    });
  });
});
