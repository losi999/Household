import { default as schema } from '@household/shared/schemas/customer-request';
import { Customer } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { customerDataFactory } from '@household/shared/common/test-data-factory';

describe('Customer schema', () => {
  const tester = jsonSchemaTesterFactory<Customer.Request>(schema);
  tester.validateSuccess(customerDataFactory.request());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...customerDataFactory.request(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(customerDataFactory.request({
        name: undefined,
      }), 'name');

      tester.type(customerDataFactory.request({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(customerDataFactory.request({
        name: '',
      }), 'name', 1);
    });

    describe('if data.description', () => {
      tester.type(customerDataFactory.request({
        description: 1 as any,
      }), 'description', 'string');

      tester.minLength(customerDataFactory.request({
        description: '',
      }), 'description', 1);
    });

    describe('if data.isGroup', () => {
      tester.required(customerDataFactory.request({
        isGroup: undefined,
      }), 'isGroup');

      tester.type(customerDataFactory.request({
        isGroup: 1 as any,
      }), 'isGroup', 'boolean');
    });

    describe('if data.rating', () => {
      tester.required(customerDataFactory.request({
        rating: undefined,
      }), 'rating');

      tester.type(customerDataFactory.request({
        rating: '1' as any,
      }), 'rating', 'integer');

      tester.minimum(customerDataFactory.request({
        rating: 0,
      }), 'rating', 1);

      tester.maximum(customerDataFactory.request({
        rating: 6,
      }), 'rating', 5);
    });
  });
});
