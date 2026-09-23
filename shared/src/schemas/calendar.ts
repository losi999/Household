import { Api } from '@household/shared/types/api';
import { ObjectSchema } from '@household/shared/types/schema';

export const dateRange: ObjectSchema<Api.Calendar.DateRange> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'dateFrom',
    'dateTo',
  ],
  properties: {
    dateFrom: {
      type: 'string',
      format: 'date',
    },
    dateTo: {
      type: 'string',
      format: 'date',
      formatMinimum: {
        $data: '1/dateFrom',
      },
    },
  },
};

export const day: ObjectSchema<Api.Calendar.Day> = {
  type: 'object',
  additionalProperties: false,
  required: ['day'],
  properties: {
    day: {
      type: 'string',
      format: 'date',
    },
  },
};
