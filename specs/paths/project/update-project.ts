import * as Project from '@household/shared/schemas/project';
import { createPath } from '@household/shared/common/schema-utils';

export const updateProject = createPath({
  method: 'put',
  tags: ['Project'],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: Project.projectId.properties.projectId,
    },
  ],
  requestBodySchema: Project.request,
  response: {
    statusCode: 201,
    description: 'Project updated',
    schema: Project.projectId,
  },
});
