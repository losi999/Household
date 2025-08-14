import { CalendarEntryType } from '@household/shared/enums';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Calendar.Entry.Request> = {
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
      enum: Object.values(CalendarEntryType),
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

export default schema;
