import { default as schema } from '@household/shared/schemas/customer-id-job-name';
import { Customer } from '@household/shared/types/types';
import { customerDataFactory } from '@household/shared/common/test-data-factory';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Customer id and job name schema', () => {
  const tester = jsonSchemaTesterFactory<Customer.CustomerId & {jobName: Customer.Job.Name['name']}>(schema);

  const jobName = 'vágás';

  tester.validateSuccess({
    customerId: customerDataFactory.id(),
    jobName,
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        customerId: customerDataFactory.id(),
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
        customerId: customerDataFactory.id('not-valid'),
        jobName,
      }, 'customerId');
    });

    describe('if data.jobName', () => {
      tester.required({
        customerId: customerDataFactory.id(),
        jobName: undefined,
      }, 'jobName');

      tester.type({
        customerId: customerDataFactory.id(),
        jobName: 1 as any,
      }, 'jobName', 'string');

      tester.minLength({
        customerId: customerDataFactory.id(),
        jobName: '',
      }, 'jobName', 1);
    });
  });
});
