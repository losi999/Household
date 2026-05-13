import { default as schema } from '@household/shared/schemas/customer-job-request';
import { Customer } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('Customer job request schema', () => {
  const tester = jsonSchemaTesterFactory<Customer.Job.Request>(schema);
  tester.validateSuccess(testDataFactory.customer.job.request({
    prices: [{}],
  }));

  tester.validateSuccess(testDataFactory.customer.job.request({
    body: {
      description: undefined,
    },
    prices: [{}],
  }), 'without description');

  tester.validateSuccess(testDataFactory.customer.job.request({
    body: {
      additionalPrice: undefined,
    },
    prices: [{}],
  }), 'without additionalPrice');

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        ...testDataFactory.customer.job.request(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.name', () => {
      tester.required(testDataFactory.customer.job.request({
        body: {
          name: undefined,
        },
      }), 'name');

      tester.type(testDataFactory.customer.job.request({
        body: {
          name: 1 as any,
        },
      }), 'name', 'string');

      tester.minLength(testDataFactory.customer.job.request({
        body: {
          name: '',
        },
      }), 'name', 1);
    });

    describe('if data.description', () => {
      tester.type(testDataFactory.customer.job.request({
        body: {
          description: 1 as any,
        },
      }), 'description', 'string');

      tester.minLength(testDataFactory.customer.job.request({
        body: {
          description: '',
        },
      }), 'description', 1);
    });

    describe('if data.duration', () => {
      tester.required(testDataFactory.customer.job.request({
        body: {
          duration: undefined,
        },
      }), 'duration');

      tester.type(testDataFactory.customer.job.request({
        body: {
          duration: '1' as any,
        },
      }), 'duration', 'integer');

      tester.exclusiveMinimum(testDataFactory.customer.job.request({
        body: {
          duration: -1,
        },
      }), 'duration', 0);
    });

    describe('if data.additionalPrice', () => {
      tester.type(testDataFactory.customer.job.request({
        body: {
          additionalPrice: '1' as any,
        },
      }), 'additionalPrice', 'integer');
    });

    describe('if data.prices', () => {
      tester.type({
        ...testDataFactory.customer.job.request(),
        prices: {} as any,
      }, 'prices', 'array');
      
      tester.minItems({
        ...testDataFactory.customer.job.request(),
        prices: [],
      }, 'prices', 1);
    });

    describe('if data.prices[0]', () => {      
      tester.type({
        ...testDataFactory.customer.job.request(),
        prices: [1] as any,
      }, 'prices/0', 'object');

      tester.additionalProperties({
        ...testDataFactory.customer.job.request(),
        prices: [
          {
            name: 'name',
            amount: 1000,
            extra: 1,
          } as any,
        ],
      }, 'prices/0');
    });

    describe('if data.prices[0].priceId', () => {      
      tester.required(testDataFactory.customer.job.request({
        prices: [
          {
            priceId: undefined,
          },
        ],
      }), 'priceId');

      tester.type(testDataFactory.customer.job.request({
        prices: [
          {
            priceId: 1 as any,
          },
        ],
      }), 'priceId', 'string');

      tester.pattern(testDataFactory.customer.job.request({
        prices: [
          {
            priceId: testDataFactory.price.id('not-mongo-id'),
          },
        ],
      }), 'priceId');
    });

    describe('if data.prices[0].quantity', () => {      
      tester.required(testDataFactory.customer.job.request({
        prices: [
          {
            quantity: undefined,
          },
        ],
      }), 'quantity');

      tester.type(testDataFactory.customer.job.request({
        prices: [
          {
            quantity: '1' as any,
          },
        ],
      }), 'quantity', 'number');

      tester.exclusiveMinimum(testDataFactory.customer.job.request({
        prices: [
          {
            quantity: 0,
          },
        ],
      }), 'quantity', 0);
    });
  });
});
