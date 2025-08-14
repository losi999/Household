import { CalendarDayType } from '@household/shared/enums';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';

const vacationRequestSchema: StrictJSONSchema7<Calendar.Day.VacationRequest> = {
  type: 'object',
  additionalProperties: false,
  required: ['dayType'],
  properties: {
    dayType: {
      type: 'string',
      const: CalendarDayType.Vacation,
    },
  },
};

const workdayRequestSchema: StrictJSONSchema7<Calendar.Day.WorkdayRequest> = {
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
      const: CalendarDayType.Workday,
    },
    start: {
      type: 'integer',
      minimum: 1,
      maximum: 96,
    },
    end: {
      type: 'integer',
      minimum: 1,
      maximum: 96,
      exclusiveMinimum: {
        $data: '1/start',
      },
    } as any,
  },
};

const schema: StrictJSONSchema7<Calendar.Day.Request> = {
  oneOf: [
    vacationRequestSchema,
    workdayRequestSchema,
  ],
};

export default schema;
