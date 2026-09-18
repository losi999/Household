import { transactionId } from '@household/shared/schemas/transaction';
import { accountId } from '@household/shared/schemas/account';
import { ObjectSchema } from '@household/shared/types/schema';
import { Api } from '@household/shared/types/api';

const schema: ObjectSchema<Api.Account.AccountId & Api.Transaction.TransactionId> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...transactionId.required,
    ...accountId.required,
  ],
  properties: {
    ...transactionId.properties as any,
    ...accountId.properties,
  },
};

export default schema;
