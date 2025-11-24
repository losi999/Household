
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Calendar.DateRange> = {
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
      formatMinimum: {
        $data: '1/dateFrom',
      },
    } as any,
  },
};

export default schema;
