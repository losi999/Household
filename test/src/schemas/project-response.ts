import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { default as projectId } from '@household/shared/schemas/project-id';
import { default as project } from '@household/shared/schemas/project-request';

const schema: StrictJSONSchema7<Responses.Project> = {
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
};

export default schema;
