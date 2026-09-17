import * as Project from '@household/shared/schemas/project';
import { createPath } from '@household/shared/common/schema-utils';

export const deleteProject = createPath({
  method: 'delete',
  tags: ['Project'],
  parameters: [
    {
      in: 'path',
      name: 'projectId',
      schema: Project.projectId.properties.projectId,
    },
  ],
  response: {
    statusCode: 204,
    description: 'Project deleted',
  },
});
