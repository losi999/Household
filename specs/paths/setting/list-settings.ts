import { PathItemObject } from 'openapi3-ts/oas32';
import * as Setting from '@household/shared/schemas/setting';

export const listSettings: PathItemObject = {
  get: {
    tags: ['Setting'],
    responses: {
      200: {
        description: 'List of settings',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: Setting.response,
            },
          },
        },
      },
    },
  },
};
