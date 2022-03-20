import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Project } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Project.Id> = {
  type: 'object',
  additionalProperties: false,
  required: ['projectId'],
  properties: {
    projectId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9]{24}$'
    },
  },
};

export default schema;
