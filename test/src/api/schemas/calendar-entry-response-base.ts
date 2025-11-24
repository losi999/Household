import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';
import { default as calendarEntryId } from '@household/shared/schemas/calendar-entry-id';
import { default as day } from '@household/shared/schemas/calendar-day';
import { default as base } from '@household/shared/schemas/partials/calendar-entry-base';

const schema: StrictJSONSchema7<Calendar.Entry.ResponseBase> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...day.required,
    ...base.required,
    ...calendarEntryId.required,
  ],
  properties: {
    ...calendarEntryId.properties,
    ...day.properties,
    ...base.properties,
  },
};

export default schema;
