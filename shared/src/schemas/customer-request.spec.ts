import { default as schema } from '@household/shared/schemas/customer-request';
import { Customer } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('Customer schema', () => {
  const tester = jsonSchemaTesterFactory<Customer.Request>(schema);
  tester.validateSuccess(testDataFactory.customer.request());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.customer.request(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(testDataFactory.customer.request({
        name: undefined,
      }), 'name');

      tester.type(testDataFactory.customer.request({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(testDataFactory.customer.request({
        name: '',
      }), 'name', 1);
    });

    describe('if data.description', () => {
      tester.type(testDataFactory.customer.request({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(testDataFactory.customer.request({
        description: '',
      }), 'description', 1);
    });

    describe('if data.isGroup', () => {
      tester.required(testDataFactory.customer.request({
        isGroup: undefined,
      }), 'isGroup');

      tester.type(testDataFactory.customer.request({
        isGroup: 1 as any,
      }), 'isGroup', 'boolean');
    });

    describe('if data.rating', () => {
      tester.required(testDataFactory.customer.request({
        rating: undefined,
      }), 'rating');

      tester.type(testDataFactory.customer.request({
        rating: '1' as any,
      }), 'rating', 'integer');

      tester.minimum(testDataFactory.customer.request({
        rating: 0,
      }), 'rating', 1);

      tester.maximum(testDataFactory.customer.request({
        rating: 6,
      }), 'rating', 5);
    });
  });
});
