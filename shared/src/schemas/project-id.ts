import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

/** @deprecated */
const schema: StrictJSONSchema7<Api.Project.ProjectId> = {
  type: 'object',
  additionalProperties: false,
  required: ['projectId'],
  properties: {
    projectId: mongoId,
  },
};

export default schema;
