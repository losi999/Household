import { default as schema } from '@household/shared/schemas/recipient-request';
import { Customer } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { createCustomerRequest } from '@household/shared/common/test-data-factory';

describe('Customer schema', () => {
  const tester = jsonSchemaTesterFactory<Customer.Request>(schema);
  tester.validateSuccess(createCustomerRequest());

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...createCustomerRequest(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(createCustomerRequest({
        name: undefined,
      }), 'name');

      tester.type(createCustomerRequest({
        name: 1 as any,
      }), 'name', 'string');

      tester.minLength(createCustomerRequest({
        name: '',
      }), 'name', 1);
    });
  });
});
