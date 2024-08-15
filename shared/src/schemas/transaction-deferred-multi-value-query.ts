
import { default as deferredQuery } from '@household/shared/schemas/transaction-deferred-query';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<{
  isSettled: string[];
  transactionId: Transaction.Id[];
}> = {
  type: [
    'object',
    'null',
  ],
  additionalProperties: false,
  properties: {
    transactionId: {
      type: 'array',
      items: deferredQuery.properties.transactionId,
    },
    isSettled: {
      type: 'array',
      items: deferredQuery.properties.isSettled,
    },
  },
};

export default schema;
