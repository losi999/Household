import { PathItemObject } from 'openapi3-ts/oas32';
import * as File from '@household/shared/schemas/file';

export const listFiles: PathItemObject = {
  get: {
    tags: ['File'],
    responses: {
      200: {
        description: 'List of files',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: File.response,
            },
          },
        },
      },
    },
  },
};
