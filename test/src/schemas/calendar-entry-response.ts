import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';
import { default as quantity } from '@household/shared/schemas/partials/customer-job-quantity';
import { default as price } from '@household/test/schemas/price-response';
import { default as priceBase } from '@household/shared/schemas/partials/price-base';
import { default as customer } from '@household/test/schemas/customer-response';
import { default as calendarEntryId } from '@household/shared/schemas/calendar-entry-id';
import { default as day } from '@household/shared/schemas/calendar-day';
import { default as base } from '@household/shared/schemas/partials/calendar-entry-base';
import { CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';

const personalEntryResponseSchema: StrictJSONSchema7<Calendar.Entry.PersonalEntryResponse> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...day.required,
    ...base.required,
    'entryType',
    ...calendarEntryId.required,
  ],
  properties: {
    ...calendarEntryId.properties,
    ...day.properties,
    ...base.properties,
    entryType: {
      type: 'string',
      const: CalendarEntryType.Personal,
    },
  },
};

const issueEntryResponseSchema: StrictJSONSchema7<Calendar.Entry.IssueEntryResponse> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...day.required,
    ...base.required,
    'entryType',
    ...calendarEntryId.required,
  ],
  properties: {
    ...calendarEntryId.properties,
    ...day.properties,
    ...base.properties,
    entryType: {
      type: 'string',
      const: CalendarEntryType.Issue,
    },
  },
};

const workEntryResponseSchema: StrictJSONSchema7<Calendar.Entry.WorkEntryResponse> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'customer',
    ...day.required,
    ...base.required,
    'entryType',
    ...calendarEntryId.required,
  ],
  properties: {
    ...calendarEntryId.properties,
    customer,
    ...day.properties,
    ...base.properties,
    entryType: {
      type: 'string',
      const: CalendarEntryType.Work,
    },
    resolution: {
      oneOf: [
        {
          type: 'object',
          additionalProperties: false,
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              enum: [
                CalendarEntryResolutionStatus.Paid,
                CalendarEntryResolutionStatus.PendingTransfer,
              ],
            },
            delay: {
              type: 'integer',
              exclusiveMinimum: 0,
            },
          },
        },
        {
          type: 'object',
          additionalProperties: false,
          required: ['status'],
          properties: {
            status: {
              type: 'string',
              const: CalendarEntryResolutionStatus.NoShow,
            },
          },
        },
      ],
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
              ...price.required,
              ...quantity.required,
            ],
            properties: {
              ...price.properties,
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

const schema: StrictJSONSchema7<Calendar.Entry.Response> = {
  oneOf: [
    personalEntryResponseSchema,
    issueEntryResponseSchema,
    workEntryResponseSchema,
  ],
};

export default schema;
