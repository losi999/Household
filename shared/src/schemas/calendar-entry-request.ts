import { CalendarEntryType } from '@household/shared/enums';
import { default as quantity } from '@household/shared/schemas/partials/customer-job-quantity';
import { default as priceId } from '@household/shared/schemas/price-id';
import { default as customerId } from '@household/shared/schemas/customer-id';
import { default as priceBase } from '@household/shared/schemas/partials/price-base';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';

const personalEntryRequestSchema: StrictJSONSchema7<Calendar.Entry.PersonalEntryRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'day',
    'title',
    'entryType',
    'start',
    'end',
  ],
  properties: {
    day: {
      type: 'string',
      format: 'date',
    },
    title: {
      type: 'string',
      minLength: 1,
    },
    description: {
      type: 'string',
      minLength: 1,
    },
    entryType: {
      type: 'string',
      const: CalendarEntryType.Personal,
    },
    start: {
      type: 'integer',
      minimum: 0,
      maximum: 96,
    },
    end: {
      type: 'integer',
      minimum: 0,
      maximum: 96,
      exclusiveMinimum: {
        $data: '1/start',
      },
    } as any,
  },
};

const issueEntryRequestSchema: StrictJSONSchema7<Calendar.Entry.IssueEntryRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'day',
    'title',
    'entryType',
    'start',
    'end',
  ],
  properties: {
    day: {
      type: 'string',
      format: 'date',
    },
    title: {
      type: 'string',
      minLength: 1,
    },
    description: {
      type: 'string',
      minLength: 1,
    },
    entryType: {
      type: 'string',
      const: CalendarEntryType.Issue,
    },
    start: {
      type: 'integer',
      minimum: 0,
      maximum: 96,
    },
    end: {
      type: 'integer',
      minimum: 0,
      maximum: 96,
      exclusiveMinimum: {
        $data: '1/start',
      },
    } as any,
  },
};

const workEntryRequestSchema: StrictJSONSchema7<Calendar.Entry.WorkEntryRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'day',
    'title',
    'entryType',
    'start',
    'end',
    ...customerId.required,
  ],
  properties: {
    ...customerId.properties,
    day: {
      type: 'string',
      format: 'date',
    },
    title: {
      type: 'string',
      minLength: 1,
    },
    description: {
      type: 'string',
      minLength: 1,
    },
    entryType: {
      type: 'string',
      const: CalendarEntryType.Work,
    },
    start: {
      type: 'integer',
      minimum: 0,
      maximum: 96,
    },
    end: {
      type: 'integer',
      minimum: 0,
      maximum: 96,
      exclusiveMinimum: {
        $data: '1/start',
      },
    } as any,
    prices: {
      type: 'array',
      minItems: 1,
      items: {
        oneOf: [
          {
            type: 'object',
            additionalProperties: false,
            required: [
              ...priceId.required,
              ...quantity.required,
            ],
            properties: {
              ...priceId.properties,
              ...quantity.properties,
            },
          }, 
          {
            type: 'object',
            additionalProperties: false,
            required: [...priceBase.required],
            properties: {
              ...priceBase.properties,
              amount: {
                ...priceBase.properties.amount,
                exclusiveMinimum: undefined,
              },
            },
          },
        ],
      },
    },
  },
};

const schema: StrictJSONSchema7<Calendar.Entry.Request> = {
  oneOf: [
    personalEntryRequestSchema,
    issueEntryRequestSchema,
    workEntryRequestSchema,
  ],
};

export default schema;
