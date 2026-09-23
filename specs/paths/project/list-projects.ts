import * as Project from '@household/shared/schemas/project';
import { createPath } from '@household/shared/common/schema-utils';

export const listProjects = createPath({
  method: 'get',
  tags: ['Project'],
  response: {
    statusCode: 200,
    description: 'List of projects',
    schema: Project.responseList,
  },
});
