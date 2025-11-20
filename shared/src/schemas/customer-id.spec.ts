import { default as schema } from '@household/shared/schemas/customer-id';
import { Customer } from '@household/shared/types/types';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Customer id schema', () => {
  const tester = jsonSchemaTesterFactory<Customer.CustomerId>(schema);

  tester.validateSuccess({
    customerId: testDataFactory.customer.id(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        customerId: testDataFactory.customer.id(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.customerId', () => {
      tester.required({
        customerId: undefined,
      }, 'customerId');

      tester.type({
        customerId: 1 as any,
      }, 'customerId', 'string');

      tester.pattern({
        customerId: testDataFactory.customer.id('not-valid'),
      }, 'customerId');
    });
  });
});
