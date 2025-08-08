import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Customer } from '@household/shared/types/types';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';
import { default as name } from '@household/shared/schemas/partials/customer-job-name';

const schema: StrictJSONSchema7<Customer.CustomerId & {jobName: Customer.JobName['name']}> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'customerId',
    'jobName',
  ],
  properties: {
    customerId: mongoId,
    jobName: name.properties.name,
  },
};

export default schema;
