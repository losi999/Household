import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Project } from '@household/shared/types/types';
import { default as projectId } from '@household/shared/schemas/project-id';

const schema: StrictJSONSchema7<Project.Id[]> = {
  type: 'array',
  minItems: 1,
  items: {
    ...projectId.properties.projectId,
  },
};

export default schema;
