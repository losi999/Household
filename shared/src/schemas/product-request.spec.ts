import { request as schema } from '@household/shared/schemas/product';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Product schema', () => {
  const tester = schemaTesterFactory<Requests.Product>(schema);

  tester.validateSuccess(testDataFactory.product.request());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.product.request(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.brand', () => {
      tester.required(testDataFactory.product.request({
        brand: undefined,
      }), 'brand');

      tester.type(testDataFactory.product.request({
        brand: 1 as any,
      }), 'brand', 'string');

      tester.minLength(testDataFactory.product.request({
        brand: '',
      }), 'brand', 1);
    });

    describe('if data.measurement', () => {
      tester.required(testDataFactory.product.request({
        measurement: undefined,
      }), 'measurement');

      tester.type(testDataFactory.product.request({
        measurement: '1' as any,
      }), 'measurement', 'number');

      tester.exclusiveMinimum(testDataFactory.product.request({
        measurement: 0,
      }), 'measurement', 0);
    });

    describe('if data.unitOfMeasurement', () => {
      tester.required(testDataFactory.product.request({
        unitOfMeasurement: undefined,
      }), 'unitOfMeasurement');

      tester.type(testDataFactory.product.request({
        unitOfMeasurement: 1 as any,
      }), 'unitOfMeasurement', 'string');

      tester.enum(testDataFactory.product.request({
        unitOfMeasurement: 'not-enum' as any,
      }), 'unitOfMeasurement');
    });

  });
});
