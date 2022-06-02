import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Project } from '@household/shared/types/types';
import { default as projectId } from '@household/shared/schemas/project-id';
import { default as project } from '@household/shared/schemas/project';

const schema: StrictJSONSchema7<Project.Response[]> = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: [
      ...projectId.required,
      ...project.required,
    ],
    properties: {
      ...projectId.properties,
      ...project.properties,
    },
  },
};

export default schema;
