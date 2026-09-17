import { request as schema } from '@household/shared/schemas/price';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';
import { Requests } from '@household/shared/types/requests';

describe('Price schema', () => {
  const tester = schemaTesterFactory<Requests.Price>(schema);
  describe('should accept', () => {
    tester.validateSuccess(testDataFactory.price.request());
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.price.request(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(testDataFactory.price.request({
        name: undefined,
      }), 'name');

      tester.type(testDataFactory.price.request({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(testDataFactory.price.request({
        name: '',
      }), 'name', 1);
    });

    describe('if data.amount', () => {
      tester.required(testDataFactory.price.request({
        amount: undefined,
      }), 'amount');

      tester.type(testDataFactory.price.request({
        amount: '1' as any,
      }), 'amount', 'integer');

      tester.exclusiveMinimum(testDataFactory.price.request({
        amount: 0,
      }), 'amount', 0);
    });
    
    describe('if data.unitOfMeasurement', () => {
      tester.required(testDataFactory.price.request({
        unitOfMeasurement: undefined,
      }), 'unitOfMeasurement');
    
      tester.type(testDataFactory.price.request({
        unitOfMeasurement: 1 as any,
      }), 'unitOfMeasurement', 'string');
    
      tester.enum(testDataFactory.price.request({
        unitOfMeasurement: 'not-enum' as any,
      }), 'unitOfMeasurement');
    });
  });
});
