import { request as schema } from '@household/shared/schemas/product';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Product schema', () => {
  const tester = schemaTesterFactory<Requests.Product>(schema);

  tester.validateSuccess(testDataFactory.product.request.generic(), 'generic product');
  tester.validateSuccess(testDataFactory.product.request.specific(), 'specific product');
  tester.validateSuccess(testDataFactory.product.request.variant(), 'variant product');

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.product.request.generic(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.productType', () => {
      tester.required(testDataFactory.product.request.generic({
        productType: undefined,
      }), 'productType');

      tester.type(testDataFactory.product.request.generic({
        productType: 1 as any,
      }), 'productType', 'string');

      tester.enum(testDataFactory.product.request.generic({
        productType: 'not valid' as any,
      }), 'productType');
    });

    describe('if data.name', () => {
      tester.required(testDataFactory.product.request.generic({
        name: undefined,
      }), 'name');

      tester.type(testDataFactory.product.request.generic({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(testDataFactory.product.request.generic({
        name: '',
      }), 'name', 1);
    });

    describe('if data.measurement', () => {
      tester.required(testDataFactory.product.request.specific({
        measurement: undefined,
      }), 'measurement');

      tester.type(testDataFactory.product.request.specific({
        measurement: '1' as any,
      }), 'measurement', 'number');

      tester.exclusiveMinimum(testDataFactory.product.request.specific({
        measurement: 0,
      }), 'measurement', 0);
    });

    describe('if data.unitOfMeasurement', () => {
      tester.required(testDataFactory.product.request.specific({
        unitOfMeasurement: undefined,
      }), 'unitOfMeasurement');

      tester.type(testDataFactory.product.request.specific({
        unitOfMeasurement: 1 as any,
      }), 'unitOfMeasurement', 'string');

      tester.enum(testDataFactory.product.request.specific({
        unitOfMeasurement: 'not-enum' as any,
      }), 'unitOfMeasurement');
    });

    describe('if data.parentProductId', () => {
      tester.required(testDataFactory.product.request.specific({
        parentProductId: undefined,
      }), 'parentProductId');

      tester.type(testDataFactory.product.request.specific({
        parentProductId: 1 as any,
      }), 'parentProductId', 'string');

      tester.pattern(testDataFactory.product.request.specific({
        parentProductId: 'not-mongo-id' as any,
      }), 'parentProductId');
    });

  });
});
