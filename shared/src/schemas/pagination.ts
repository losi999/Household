
import { Api } from '@household/shared/types/api';
import { ObjectSchema } from '@household/shared/types/schema';

const schema: ObjectSchema<Api.Pagination<string>> = {
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
    pageSize: ['pageNumber'],
    pageNumber: ['pageSize'],
  },
};

export default schema;
