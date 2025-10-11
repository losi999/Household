import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Calendar.DayProp> = {
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

export default schema;
