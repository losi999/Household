import { PathItemObject } from 'openapi3-ts/oas32';
import * as Project from '@household/shared/schemas/project';

export const mergeProjects: PathItemObject = {
  post: {
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
          schema: Project.idList,
        },
      },
    },
    responses: {
      201: {
        description: 'Projects merged',
        content: {
          'application/json': {
            schema: Project.projectId,
          },
        },
      },
    },
  },
};
