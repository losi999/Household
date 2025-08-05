import { default as schema } from '@household/shared/schemas/customer-id';
import { Customer } from '@household/shared/types/types';
import { createCustomerId } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Customer id schema', () => {
  const tester = jsonSchemaTesterFactory<Customer.CustomerId>(schema);

  tester.validateSuccess({
    customerId: createCustomerId(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        customerId: createCustomerId(),
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
        customerId: createCustomerId('not-valid'),
      }, 'customerId');
    });
  });
});
