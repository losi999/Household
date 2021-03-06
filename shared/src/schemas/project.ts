import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Project } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Project.Request> = {
  type: 'object',
  additionalProperties: false,
  required: ['name'],
  properties: {
    description: {
      type: 'string',
      minLength: 1,
    },
    name: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default schema;
