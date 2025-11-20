import { default as schema } from '@household/shared/schemas/customer-blacklist-request';
import { Customer } from '@household/shared/types/types';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Customer blacklist request schema', () => {
  const tester = jsonSchemaTesterFactory<Customer.Id[]>(schema);

  tester.validateSuccess([
    testDataFactory.customer.id(),
    testDataFactory.customer.id(),
  ]);

  describe('should deny', () => {
    describe('if data', () => {
      tester.type({ } as any, 'data', 'array');

      tester.minItems([testDataFactory.customer.id()], 'data', 2);

      tester.maxItems([
        testDataFactory.customer.id(),
        testDataFactory.customer.id(),
        testDataFactory.customer.id(),
      ], 'data', 2);
    });

    describe('if data.[0]', () => {
      tester.type([
        1 as any,
        testDataFactory.customer.id(),
      ], 'data/0', 'string');

      tester.pattern([
        testDataFactory.customer.id('not-mongo-id'),
        testDataFactory.customer.id(),
      ], 'data/0');
    });
  });
});
