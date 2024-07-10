import { default as schema } from '@household/shared/schemas/product-request';
import { Product } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createProductRequest } from '@household/shared/common/test-data-factory';

describe('Product schema', () => {
  const tester = jsonSchemaTesterFactory<Product.Request>(schema);

  tester.validateSuccess(createProductRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createProductRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.brand', () => {
      tester.required(createProductRequest({
        brand: undefined,
      }), 'brand');

      tester.type(createProductRequest({
        brand: 1 as any,
      }), 'brand', 'string');

      tester.minLength(createProductRequest({
        brand: '',
      }), 'brand', 1);
    });

    describe('if data.measurement', () => {
      tester.required(createProductRequest({
        measurement: undefined,
      }), 'measurement');

      tester.type(createProductRequest({
        measurement: '1' as any,
      }), 'measurement', 'number');

      tester.exclusiveMinimum(createProductRequest({
        measurement: 0,
      }), 'measurement', 0);
    });

    describe('if data.unitOfMeasurement', () => {
      tester.required(createProductRequest({
        unitOfMeasurement: undefined,
      }), 'unitOfMeasurement');

      tester.type(createProductRequest({
        unitOfMeasurement: 1 as any,
      }), 'unitOfMeasurement', 'string');

      tester.enum(createProductRequest({
        unitOfMeasurement: 'not-enum' as any,
      }), 'unitOfMeasurement');
    });

  });
});
