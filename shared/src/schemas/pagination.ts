
import { JSONSchema7 } from 'json-schema';

const schema: JSONSchema7 = {
  type: ['object', 'null'],
  additionalProperties: false,
  properties: {
    pageNumber: {
      type: 'string',
      pattern: '^[1-9][0-9]*$'
    },
    pageSize: {
      type: 'string',
      pattern: '^[1-9][0-9]*$'
    }
  },
  dependencies: {
    pageSize: {
      required: ['pageNumber']
    },
    pageNumber: {
      required: ['pageSize']
    }
  }
};

export default schema;
