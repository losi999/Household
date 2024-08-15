
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { default as transactionId } from '@household/shared/schemas/transaction-id';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<{
  isSettled: string;
  transactionId: Transaction.Id;
}> = {
  type: [
    'object',
    'null',
  ],
  additionalProperties: false,
  properties: {
    transactionId: transactionId.properties.transactionId,
    isSettled: {
      type: 'string',
      enum: [
        'true',
        'false',
      ],
    },
  },
};

export default schema;
