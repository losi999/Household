import { unitsOfMeasurement } from '@household/shared/constants';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Transaction } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Transaction.PaymentRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'amount',
    'issuedAt',
    'accountId',
  ],
  properties: {
    amount: {
      type: 'number',
    },
    description: {
      type: 'string',
      minLength: 1,
    },
    inventory: {
      type: 'object',
      required: ['quantity'],
      additionalProperties: false,
      properties: {
        quantity: {
          type: 'number',
          exclusiveMinimum: 0,
        },
        brand: {
          type: 'string',
          minLength: 1,
        },
        measurement: {
          type: 'number',
          exclusiveMinimum: 0,
        },
        unitOfMeasurement: {
          type: 'string',
          enum: [...unitsOfMeasurement],
        },
      },
    },
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
        },
        billingStartDate: {
          type: 'string',
          format: 'date',
        },
      },
    },
    issuedAt: {
      type: 'string',
      format: 'date-time',
    },
    accountId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{24}$',
    },
    categoryId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{24}$',
    },
    recipientId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{24}$',
    },
    projectId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{24}$',
    },
  },
};

export default schema;
