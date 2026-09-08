import { default as transactionId } from '@household/shared/schemas/transaction-id';
import { accountId } from '@household/shared/schemas/account';
import { ObjectSchema } from '@household/shared/types/schema';
import { Api } from '@household/shared/types/api';
import { Transaction } from '@household/shared/types/types';

const schema: ObjectSchema<Api.Account.AccountId & Transaction.TransactionId> = {
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
