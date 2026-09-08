import { PathItemObject } from 'openapi3-ts/oas32';
import * as Project from '@household/shared/schemas/project';

export const createProject: PathItemObject = {
  post: {
    tags: ['Project'],
    requestBody: {
      content: {
        'application/json': {
          schema: Project.request,
        },
      },
    },
    responses: {
      201: {
        description: 'Project created',
        content: {
          'application/json': {
            schema: Project.projectId,
          },
        },
      },
    },
  },
};
