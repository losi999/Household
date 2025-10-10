import { default as schema } from '@household/shared/schemas/price-request';
import { Price } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { priceDataFactory } from '@household/shared/common/test-data-factory';

describe('Price schema', () => {
  const tester = jsonSchemaTesterFactory<Price.Request>(schema);
  describe('should accept', () => {
    tester.validateSuccess(priceDataFactory.request());
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...priceDataFactory.request(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(priceDataFactory.request({
        name: undefined,
      }), 'name');

      tester.type(priceDataFactory.request({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(priceDataFactory.request({
        name: '',
      }), 'name', 1);
    });

    describe('if data.amount', () => {
      tester.required(priceDataFactory.request({
        amount: undefined,
      }), 'amount');

      tester.type(priceDataFactory.request({
        amount: '1' as any,
      }), 'amount', 'integer');

      tester.exclusiveMinimum(priceDataFactory.request({
        amount: 0,
      }), 'amount', 0);
    });
    
    describe('if data.unitOfMeasurement', () => {
      tester.required(priceDataFactory.request({
        unitOfMeasurement: undefined,
      }), 'unitOfMeasurement');
    
      tester.type(priceDataFactory.request({
        unitOfMeasurement: 1 as any,
      }), 'unitOfMeasurement', 'string');
    
      tester.enum(priceDataFactory.request({
        unitOfMeasurement: 'not-enum' as any,
      }), 'unitOfMeasurement');
    });
  });
});
