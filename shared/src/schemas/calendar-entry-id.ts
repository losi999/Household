import { StrictJSONSchema7 } from '@household/shared/types/common';
import { CalendarEntry } from '@household/shared/types/types';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

const schema: StrictJSONSchema7<CalendarEntry.CalendarEntryId> = {
  type: 'object',
  additionalProperties: false,
  required: ['calendarEntryId'],
  properties: {
    calendarEntryId: mongoId,
  },
};

export default schema;
