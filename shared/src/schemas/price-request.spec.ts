import { default as schema } from '@household/shared/schemas/price-request';
import { Price } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createPriceRequest } from '@household/shared/common/test-data-factory';

describe('Price schema', () => {
  const tester = jsonSchemaTesterFactory<Price.Request>(schema);
  describe('should accept', () => {
    tester.validateSuccess(createPriceRequest());
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createPriceRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(createPriceRequest({
        name: undefined,
      }), 'name');

      tester.type(createPriceRequest({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(createPriceRequest({
        name: '',
      }), 'name', 1);
    });

    describe('if data.amount', () => {
      tester.required(createPriceRequest({
        amount: undefined,
      }), 'amount');

      tester.type(createPriceRequest({
        amount: '1' as any,
      }), 'amount', 'integer');

      tester.exclusiveMinimum(createPriceRequest({
        amount: 0,
      }), 'amount', 0);
    });
  });
});
