import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Report } from '@household/shared/types/types';
import { default as issuedAt } from '@household/shared/schemas/partials/transaction-issued-at';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

const schema: StrictJSONSchema7<Report.Request> = {
  type: 'array',
  minItems: 1,
  items: {
    oneOf: [
      {
        type: 'object',
        additionalProperties: false,
        required: [
          'include',
          'filterType',
          'items',
        ],
        properties: {
          include: {
            type: 'boolean',
          },
          filterType: {
            type: 'string',
            enum: [
              'account',
              'category',
              'project',
              'product',
              'recipient',
            ],
          },
          items: {
            type: 'array',
            minItems: 1,
            items: mongoId,
          },
        },
      },
      {
        type: 'object',
        additionalProperties: false,
        required: [
          'filterType',
          'include',
        ],
        properties: {
          include: {
            type: 'boolean',
          },
          filterType: {
            type: 'string',
            enum: ['issuedAt'],
          },
          from: issuedAt.properties.issuedAt,
          to: {
            ...issuedAt.properties.issuedAt,
            formatExclusiveMinimum: {
              $data: '1/from',
            },
          } as any,
        },
        anyOf: [
          {
            required: ['from'],
          },
          {
            required: ['to'],
          },
        ],
      },
    ],
  },
};

export default schema;
