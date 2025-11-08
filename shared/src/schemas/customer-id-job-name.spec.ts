import { default as schema } from '@household/shared/schemas/customer-id-job-name';
import { Customer } from '@household/shared/types/types';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Customer id and job name schema', () => {
  const tester = jsonSchemaTesterFactory<Customer.CustomerId & {jobName: Customer.Job.Name['name']}>(schema);

  const jobName = 'vágás';

  tester.validateSuccess({
    customerId: testDataFactory.customer.id(),
    jobName,
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        customerId: testDataFactory.customer.id(),
        jobName,
        extra: 1,
      } as any, 'data');
    });

    describe('if data.customerId', () => {
      tester.required({
        customerId: undefined,
        jobName,
      }, 'customerId');

      tester.type({
        customerId: 1 as any,
        jobName,
      }, 'customerId', 'string');

      tester.pattern({
        customerId: testDataFactory.customer.id('not-valid'),
        jobName,
      }, 'customerId');
    });

    describe('if data.jobName', () => {
      tester.required({
        customerId: testDataFactory.customer.id(),
        jobName: undefined,
      }, 'jobName');

      tester.type({
        customerId: testDataFactory.customer.id(),
        jobName: 1 as any,
      }, 'jobName', 'string');

      tester.minLength({
        customerId: testDataFactory.customer.id(),
        jobName: '',
      }, 'jobName', 1);
    });
  });
});
