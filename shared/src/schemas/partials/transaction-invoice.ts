import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Transaction.InvoiceDate<string> & Transaction.InvoiceNumber> = {
  type: 'object',
  additionalProperties: false,
  dependentRequired: {
    billingStartDate: ['billingEndDate'],
    billingEndDate: ['billingStartDate'],
    invoiceNumber: [
      'billingEndDate',
      'billingStartDate',
    ],
  },
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
};

export default schema;
