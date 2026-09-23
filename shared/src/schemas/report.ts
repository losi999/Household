import { issuedAt } from '@household/shared/schemas/transaction';
import { Requests } from '@household/shared/types/requests';
import { StrictSchema } from '@household/shared/types/schema';
import { Api } from '@household/shared/types/api';
import { MONGO_ID_PATTERN } from '@household/shared/constants';

const catalogItemFilter: StrictSchema<Api.Report.CatalogItemFilter> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'filterType',
    'include',
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
      items: {
        type: 'string',
        pattern: MONGO_ID_PATTERN,
      },
    },
  },
};

const issuedAtFilter: StrictSchema<Api.Report.IssuedAtFilter> = {
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
    },
  },
  anyOf: [
    {
      type: 'object',
      required: ['from'],
    },
    {
      type: 'object',
      required: ['to'],
    },
  ],
};

export const request: StrictSchema<Requests.Report> = {
  type: 'array',
  minItems: 1,
  items: {
    type: 'object',
    oneOf: [
      catalogItemFilter,
      issuedAtFilter,
    ],
  },
};
