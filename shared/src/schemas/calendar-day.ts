import { StrictSchema } from '@household/shared/types/schema';
import { Requests } from '@household/shared/types/requests';
import { DAY_END, DAY_START } from '@household/shared/constants';
import { CalendarDayType } from '@household/shared/enums';
import { Responses } from '@household/shared/types/responses';
import { response as calendarEntryResponse } from '@household/shared/schemas/calendar-entry';
import { combine } from '@household/shared/common/schema-utils';
import { day } from '@household/shared/schemas/calendar';

const vacationRequest: StrictSchema<Requests.CalendarDayVacation> = {
  type: 'object',
  additionalProperties: false,
  required: ['dayType'],
  properties: {
    dayType: {
      type: 'string',
      enum: [CalendarDayType.Vacation],
    },
  },
};

const workdayRequest: StrictSchema<Requests.CalendarDayWorkday> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'dayType',
    'start',
    'end',
  ],
  properties: {
    dayType: {
      type: 'string',
      enum: [CalendarDayType.Workday],
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

export const request: StrictSchema<Requests.CalendarDay> = {
  type: 'object',
  oneOf: [
    vacationRequest,
    workdayRequest,
  ],
};

const entries: StrictSchema<Pick<Responses.CalendarDay, 'entries'>> = {
  type: 'object',
  required: ['entries'],
  properties: {
    entries: {
      type: 'array',
      items: calendarEntryResponse,
    },
  },
};

const workdayResponse = combine<Responses.CalendarDayWorkday>([
  day,
  workdayRequest,
  entries,
]);

const vacationResponse = combine<Responses.CalendarDayVacation>([
  day,
  vacationRequest,
  entries,
]);

const holidayResponse = combine<Responses.CalendarDayHoliday>([
  day,
  entries,
  {
    type: 'object',
    required: ['dayType'],
    properties: {
      dayType: {
        type: 'string',
        enum: [CalendarDayType.Holiday],
      },
    },
  },
]);

const weekendResponse = combine<Responses.CalendarDayWeekend>([
  day,
  entries,
  {
    type: 'object',
    required: [
      'dayType',
      'start',
      'end',
    ],
    properties: {
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
      dayType: {
        type: 'string',
        enum: [CalendarDayType.Weekend],
      },
    },
  },
]);

export const response: StrictSchema<Responses.CalendarDay> = {
  type: 'object',
  oneOf: [
    workdayResponse,
    vacationResponse,
    holidayResponse,
    weekendResponse,
  ],
};

export const responseList: StrictSchema<Responses.CalendarDay[]> = {
  type: 'array',
  items: response,
};
