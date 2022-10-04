import { default as schema } from '@household/shared/schemas/product-request';
import { Product } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createProductRequest } from '@household/shared/common/test-data-factory';

describe('Product schema', () => {
  const tester = jsonSchemaTesterFactory<Product.Request>(schema);

  tester.validateSuccess(createProductRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.validateSchemaAdditionalProperties({
        ...createProductRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.brand', () => {
      tester.validateSchemaRequired(createProductRequest({
        brand: undefined,
      }), 'brand');

      tester.validateSchemaType(createProductRequest({
        brand: 1 as any,
      }), 'brand', 'string');

      tester.validateSchemaMinLength(createProductRequest({
        brand: '',
      }), 'brand', 1);
    });

    describe('if data.measurement', () => {
      tester.validateSchemaRequired(createProductRequest({
        measurement: undefined,
      }), 'measurement');

      tester.validateSchemaType(createProductRequest({
        measurement: '1' as any,
      }), 'measurement', 'number');

      tester.validateSchemaExclusiveMinimum(createProductRequest({
        measurement: 0,
      }), 'measurement', 0);
    });

    describe('if data.unitOfMeasurement', () => {
      tester.validateSchemaRequired(createProductRequest({
        unitOfMeasurement: undefined,
      }), 'unitOfMeasurement');

      tester.validateSchemaType(createProductRequest({
        unitOfMeasurement: 1 as any,
      }), 'unitOfMeasurement', 'string');

      tester.validateSchemaEnumValue(createProductRequest({
        unitOfMeasurement: 'not-enum' as any,
      }), 'unitOfMeasurement');
    });

  });
});
