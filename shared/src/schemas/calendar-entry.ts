import { Api } from '@household/shared/types/api';
import { combine } from '@household/shared/common/schema-utils';
import { ObjectSchema, StrictSchema } from '@household/shared/types/schema';
import { Requests } from '@household/shared/types/requests';
import { DAY_END, DAY_START, MONGO_ID_PATTERN } from '@household/shared/constants';
import { CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { customerId, customerJobQuantity, responseCustomerJobCost } from '@household/shared/schemas/customer';
import { priceId } from '@household/shared/schemas/price';
import { amount } from '@household/shared/schemas/transaction';
import { response as customerResponse } from '@household/shared/schemas/customer';
import { day } from '@household/shared/schemas/calendar';
import { Responses } from '@household/shared/types/responses';

export const calendarEntryId: ObjectSchema<Api.Calendar.Entry.CalendarEntryId> = {
  type: 'object',
  additionalProperties: false,
  required: ['calendarEntryId'],
  properties: {
    calendarEntryId: {
      type: 'string',
      pattern: MONGO_ID_PATTERN,
    },
  },
};

const base: ObjectSchema<Api.Calendar.Entry.Base> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'start',
    'end',
  ],
  properties: {
    title: {
      type: 'string',
      minLength: 1,
    },
    description: {
      type: 'string',
      minLength: 1,
    },
    start: {
      type: 'integer',
      minimum: DAY_START,
      maximum: DAY_END,
    },
    end: {
      type: 'integer',
      minimum: DAY_START,
      maximum: DAY_END,
      exclusiveMinimum: {
        $data: '1/start',
      },
    },
  },
};

const personalRequest: ObjectSchema<Requests.CalendarEntryPersonal> = combine<Requests.CalendarEntryPersonal>([
  day,
  base,
  {
    type: 'object',
    required: ['entryType'],
    properties: {
      entryType: {
        type: 'string',
        enum: [CalendarEntryType.Personal],
      },
    },
  },
]);

const issueRequest: ObjectSchema<Requests.CalendarEntryIssue> = combine<Requests.CalendarEntryIssue>([
  day,
  base,
  {
    type: 'object',
    required: ['entryType'],
    properties: {
      entryType: {
        type: 'string',
        enum: [CalendarEntryType.Issue],
      },
    },
  },
]);

const workRequest: ObjectSchema<Requests.CalendarEntryWork> = combine<Requests.CalendarEntryWork>([
  day,
  base,
  customerId,
  {
    type: 'object',
    required: ['entryType'],
    properties: {
      entryType: {
        type: 'string',
        enum: [CalendarEntryType.Work],
      },
      additionalPrice: {
        type: 'integer',
      },
      prices: {
        type: 'array',
        minItems: 1,
        items: combine<Requests.CustomerJob['prices'][0]>([
          priceId,
          customerJobQuantity,
        ]),
      },
    },
  },
]);

export const request: StrictSchema<Requests.CalendarEntry> = {
  type: 'object',
  oneOf: [
    issueRequest,
    personalRequest,
    workRequest,
  ],
};

const resolutionPaidRequest: StrictSchema<Requests.CalendarEntryResolutionPaid> = combine<Requests.CalendarEntryResolutionPaid>([
  amount,
  {
    type: 'object',
    additionalProperties: false,
    required: ['status'],
    properties: {
      status: {
        type: 'string',
        enum: [CalendarEntryResolutionStatus.Paid],
      },
      delay: {
        type: 'integer',
        exclusiveMinimum: 0,
      },
    },
  },
]);

const resolutionPendingTransferRequest: StrictSchema<Requests.CalendarEntryResolutionPendingTransfer> = {
  type: 'object',
  additionalProperties: false,
  required: ['status'],
  properties: {
    status: {
      type: 'string',
      enum: [CalendarEntryResolutionStatus.PendingTransfer],
    },
    delay: {
      type: 'integer',
      exclusiveMinimum: 0,
    },
  },
};

const resolutionNoShowRequest: StrictSchema<Requests.CalendarEntryResolutionNoShow> = {
  type: 'object',
  additionalProperties: false,
  required: ['status'],
  properties: {
    status: {
      type: 'string',
      enum: [CalendarEntryResolutionStatus.NoShow],
    },
  },
};

export const resolutionRequest: StrictSchema<Requests.CalendarEntryResolution> = {
  type: 'object',
  oneOf: [
    resolutionPaidRequest,
    resolutionPendingTransferRequest,
    resolutionNoShowRequest,
  ],
};

const responseLean = combine<Responses.CalendarEntryLean>([
  day,
  base,
  calendarEntryId,
]);

export const responseLeanList: StrictSchema<Responses.CalendarEntryLean[]> = {
  type: 'array',
  items: responseLean,
};

const personalResponse = combine<Responses.CalendarEntryPersonal>([
  responseLean,
  {
    type: 'object',
    required: ['entryType'],
    properties: {
      entryType: {
        type: 'string',
        enum: [CalendarEntryType.Personal],
      },
    },
  },
]);

const issueResponse = combine<Responses.CalendarEntryIssue>([
  responseLean,
  {
    type: 'object',
    required: ['entryType'],
    properties: {
      entryType: {
        type: 'string',
        enum: [CalendarEntryType.Issue],
      },
    },
  },
]);

const workResponse = combine<Responses.CalendarEntryWork>([
  responseLean,
  responseCustomerJobCost,
  {
    type: 'object',
    required: [
      'entryType',
      'customer',
    ],
    properties: {
      entryType: {
        type: 'string',
        enum: [CalendarEntryType.Work],
      },
      customer: customerResponse,
      resolution: {
        type: 'object',
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
                enum: [CalendarEntryResolutionStatus.NoShow],
              },
            },
          },
        ],
      },
    },
  },
]);

export const response: StrictSchema<Responses.CalendarEntry> = {
  type: 'object',
  oneOf: [
    issueResponse,
    personalResponse,
    workResponse,
  ],
};
