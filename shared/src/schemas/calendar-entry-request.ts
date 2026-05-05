import { CalendarEntryType } from '@household/shared/enums';
import { default as quantity } from '@household/shared/schemas/partials/customer-job-quantity';
import { default as priceId } from '@household/shared/schemas/price-id';
import { default as customerId } from '@household/shared/schemas/customer-id';
import { default as priceBase } from '@household/shared/schemas/partials/price-base';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';
import { default as day } from '@household/shared/schemas/calendar-day';
import { default as base } from '@household/shared/schemas/partials/calendar-entry-base';

const personalEntryRequestSchema: StrictJSONSchema7<Calendar.Entry.PersonalEntryRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...day.required,
    ...base.required,
    'entryType',
  ],
  properties: {
    ...day.properties,
    ...base.properties,
    entryType: {
      type: 'string',
      const: CalendarEntryType.Personal,
    },
  },
};

const issueEntryRequestSchema: StrictJSONSchema7<Calendar.Entry.IssueEntryRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...day.required,
    ...base.required,
    'entryType',
  ],
  properties: {
    ...day.properties,
    ...base.properties,
    entryType: {
      type: 'string',
      const: CalendarEntryType.Issue,
    },
  },
};

const workEntryRequestSchema: StrictJSONSchema7<Calendar.Entry.WorkEntryRequest> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...day.required,
    ...base.required,
    'entryType',
    ...customerId.required,
  ],
  properties: {
    ...customerId.properties,
    ...day.properties,
    ...base.properties,
    entryType: {
      type: 'string',
      const: CalendarEntryType.Work,
    },
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
            required: ['amount'],
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
