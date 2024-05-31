import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Project } from '@household/shared/types/types';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

const schema: StrictJSONSchema7<Project.ProjectId> = {
  type: 'object',
  additionalProperties: false,
  required: ['projectId'],
  properties: {
    projectId: mongoId,
  },
};

export default schema;
