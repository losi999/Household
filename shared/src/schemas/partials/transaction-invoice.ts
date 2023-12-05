import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Transaction.Invoice<string>> = {
  type: 'object',
  additionalProperties: false,
  required: ['invoice'],
  properties: {
    invoice: {
      type: 'object',
      required: [
        'billingStartDate',
        'billingEndDate',
      ],
      additionalProperties: false,
      properties: {
        invoiceNumber: {
          type: 'string',
          minLength: 1,
        },
        billingEndDate: {
          type: 'string',
          format: 'date',
          formatExclusiveMinimum: {
            $data: '1/billingStartDate',
          },
        } as any,
        billingStartDate: {
          type: 'string',
          format: 'date',
        },
      },
    },
  },
};

export default schema;
