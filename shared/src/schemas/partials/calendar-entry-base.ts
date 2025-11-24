import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Calendar.Entry.Base> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'title',
    'start',
    'end',
  ],
  properties: {
    title: {
      type: 'string',
      minLength: 1,
    },
    description: {
      type: 'string',
      minLength: 1,
    },
    start: {
      type: 'integer',
      minimum: 0,
      maximum: 96,
    },
    end: {
      type: 'integer',
      minimum: 0,
      maximum: 96,
      exclusiveMinimum: {
        $data: '1/start',
      },
    } as any,
  },
};

export default schema;
