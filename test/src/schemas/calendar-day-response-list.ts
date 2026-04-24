import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';
import { default as calendarEntry } from '@household/test/schemas/calendar-entry-response';
import { default as day } from '@household/shared/schemas/calendar-day';
import { CalendarDayType } from '@household/shared/enums';

const workdayResponseSchema: StrictJSONSchema7<Calendar.Day.WorkdayResponse> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...day.required,
    'start',
    'end',
    'dayType',
    'entries',
  ],
  properties: {
    ...day.properties,
    dayType: {
      type: 'string',
      const: CalendarDayType.Workday,
    },
    start: {
      type: 'integer',
      minimum: 0,
      maximum: 96,
    },
    end: {
      type: 'integer',
      maximum: 96,
      minimum: {
        $data: '1/start',
      },
    } as any,
    entries: {
      type: 'array',
      items: calendarEntry,
    },
  },
};

const weekendResponseSchema: StrictJSONSchema7<Calendar.Day.WeekendResponse> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...day.required,
    'dayType',
    'entries',
  ],
  properties: {
    ...day.properties,
    dayType: {
      type: 'string',
      const: CalendarDayType.Weekend,
    },
    start: {
      type: 'integer',
      minimum: 0,
      maximum: 96,
    },
    end: {
      type: 'integer',
      maximum: 96,
      minimum: {
        $data: '1/start',
      },
    } as any,
    entries: {
      type: 'array',
      items: calendarEntry,
    },
  },
};

const holidayResponseSchema: StrictJSONSchema7<Calendar.Day.HolidayResponse> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...day.required,
    'dayType',
    'entries',
  ],
  properties: {
    ...day.properties,
    dayType: {
      type: 'string',
      const: CalendarDayType.Holiday,
    },
    entries: {
      type: 'array',
      items: calendarEntry,
    },
  },
};

const vacationResponseSchema: StrictJSONSchema7<Calendar.Day.VacationResponse> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...day.required,
    'dayType',
    'entries',
  ],
  properties: {
    ...day.properties,
    dayType: {
      type: 'string',
      const: CalendarDayType.Vacation,
    },
    entries: {
      type: 'array',
      items: calendarEntry,
    },
  },
};

const schema: StrictJSONSchema7<Calendar.Day.Response[]> = {
  type: 'array',
  minItems: 1,
  items: {
    oneOf: [
      workdayResponseSchema,
      weekendResponseSchema,
      holidayResponseSchema,
      vacationResponseSchema,
    ],
  },
};

export default schema;
