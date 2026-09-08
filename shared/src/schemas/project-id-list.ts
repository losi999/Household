import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { default as projectId } from '@household/shared/schemas/project-id';

/** @deprecated */
const schema: StrictJSONSchema7<Api.Project.Id[]> = {
  type: 'array',
  minItems: 1,
  items: {
    ...projectId.properties.projectId,
  },
};

export default schema;
