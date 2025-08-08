import { default as schema } from '@household/shared/schemas/price-id';
import { Price } from '@household/shared/types/types';
import { createPriceId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Price id schema', () => {
  const tester = jsonSchemaTesterFactory<Price.PriceId>(schema);

  tester.validateSuccess({
    priceId: createPriceId(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        priceId: createPriceId(),
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
        priceId: createPriceId('not-valid'),
      }, 'priceId');
    });
  });
});
