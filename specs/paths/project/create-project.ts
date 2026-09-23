import * as Project from '@household/shared/schemas/project';
import { createPath } from '@household/shared/common/schema-utils';

export const createProject = createPath({
  method: 'post',
  tags: ['Project'],
  requestBodySchema: Project.request,
  response: {
    statusCode: 201,
    description: 'Project created',
    schema: Project.projectId,
  },
});
