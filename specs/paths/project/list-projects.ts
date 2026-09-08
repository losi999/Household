import { PathItemObject } from 'openapi3-ts/oas32';
import * as Project from '@household/shared/schemas/project';

export const listProjects: PathItemObject = {
  get: {
    tags: ['Project'],
    responses: {
      200: {
        description: 'List of projects',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: Project.response,
            },
          },
        },
      },
    },
  },
};
