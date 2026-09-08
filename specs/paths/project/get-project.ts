import { PathItemObject } from 'openapi3-ts/oas32';
import * as Project from '@household/shared/schemas/project';

export const getProject: PathItemObject = {
  get: {
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
      200: {
        description: 'Project',
        content: {
          'application/json': {
            schema: Project.response,
          },
        },
      },
    },
  },
};
