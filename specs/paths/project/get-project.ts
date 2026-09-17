import * as Project from '@household/shared/schemas/project';
import { createPath } from '@household/shared/common/schema-utils';

export const getProject = createPath({
  method: 'get',
  tags: ['Project'],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: Project.projectId.properties.projectId,
    },
  ],
  response: {
    statusCode: 200,
    description: 'Project',
    schema: Project.response,
  },
});
