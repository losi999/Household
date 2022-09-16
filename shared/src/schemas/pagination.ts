
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Common } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Common.Pagination<string>> = {
  type: [
    'object',
    'null',
  ],
  additionalProperties: false,
  properties: {
    pageNumber: {
      type: 'string',
      pattern: '^[1-9][0-9]*$',
    },
    pageSize: {
      type: 'string',
      pattern: '^[1-9][0-9]*$',
    },
  },
  dependencies: {
    pageSize: {
      required: ['pageNumber'],
    },
    pageNumber: {
      required: ['pageSize'],
    },
  },
};

export default schema;
