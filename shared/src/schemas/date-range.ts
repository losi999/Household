
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { CalendarEntry } from '@household/shared/types/types';

const schema: StrictJSONSchema7<CalendarEntry.DateRange> = {
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
    },
  },
};

export default schema;
