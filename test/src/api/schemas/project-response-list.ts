import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Project } from '@household/shared/types/types';
import { default as project } from '@household/test/api/schemas/project-response';

const schema: StrictJSONSchema7<Project.Response[]> = {
  type: 'array',
  items: project,
};

export default schema;
