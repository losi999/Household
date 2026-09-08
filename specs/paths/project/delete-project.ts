import { PathItemObject } from 'openapi3-ts/oas32';
import * as Project from '@household/shared/schemas/project';

export const deleteProject: PathItemObject = {
  delete: {
    tags: ['Project'],
    parameters: [
      {
        name: 'projectId',
        in: 'path',
        required: true,
        schema: Project.projectId.properties.projectId,
      },
    ],
    responses: {
      204: {
        description: 'Project deleted',
      },
    },
  },
};
