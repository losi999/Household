import { JSONSchema7 } from 'json-schema';
import { default as transactionId } from '@household/shared/schemas/transaction-id';
import { default as accountId } from '@household/shared/schemas/account-id';

const schema: JSONSchema7 = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...transactionId.required,
    ...accountId.required,
  ],
  properties: {
    ...transactionId.properties,
    ...accountId.properties,
  },
};

export default schema;
