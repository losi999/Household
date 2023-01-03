import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Transaction.TransferAmount> = {
  type: 'object',
  required: ['transferAmount'],
  additionalProperties: false,
  properties: {
    transferAmount: {
      type: 'number',
    },
  },
};

export default schema;
