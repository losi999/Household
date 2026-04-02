import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';
import { default as calendarEntry } from '@household/test/api/schemas/calendar-entry-response-base';

const schema: StrictJSONSchema7<Calendar.Entry.ResponseBase[]> = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: [...calendarEntry.required],
    properties: {
      ...calendarEntry.properties,
    },
  },
};

export default schema;
