import * as Project from '@household/shared/schemas/project';
import { createPath } from '@household/shared/common/schema-utils';

export const mergeProjects = createPath({
  method: 'post',
  tags: ['Project'],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: Project.projectId.properties.projectId,
    },
  ],
  requestBodySchema: Project.idList,
  response: {
    statusCode: 201,
    description: 'Projects merged',
    schema: Project.projectId,
  },
});
