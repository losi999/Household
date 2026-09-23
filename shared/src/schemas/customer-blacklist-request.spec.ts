import { customerBlacklistRequest as schema } from '@household/shared/schemas/customer';
import { Api } from '@household/shared/types/api';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Customer blacklist request schema', () => {
  const tester = schemaTesterFactory<Api.Customer.Id[]>(schema);

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
