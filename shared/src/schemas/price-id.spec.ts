import { default as schema } from '@household/shared/schemas/price-id';
import { Price } from '@household/shared/types/types';
import { priceDataFactory } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Price id schema', () => {
  const tester = jsonSchemaTesterFactory<Price.PriceId>(schema);

  tester.validateSuccess({
    priceId: priceDataFactory.id(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        priceId: priceDataFactory.id(),
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
        priceId: priceDataFactory.id('not-valid'),
      }, 'priceId');
    });
  });
});
