import { PathItemObject } from 'openapi3-ts/oas32';
import * as Project from '@household/shared/schemas/project';

export const updateProject: PathItemObject = {
  put: {
    tags: ['Project'],
    parameters: [
      {
        name: 'projectId',
        in: 'path',
        required: true,
        schema: Project.projectId.properties.projectId,
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: Project.request,
        },
      },
    },
    responses: {
      201: {
        description: 'Project updated',
        content: {
          'application/json': {
            schema: Project.projectId,
          },
        },
      },
    },
  },
};
