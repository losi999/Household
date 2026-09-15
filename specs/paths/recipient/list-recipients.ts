import { PathItemObject } from 'openapi3-ts/oas32';
import * as Recipient from '@household/shared/schemas/recipient';

export const listRecipients: PathItemObject = {
  get: {
    tags: ['Recipient'],
    responses: {
      200: {
        description: 'List of recipients',
        content: {
          'application/json': {
            schema: {
              type: 'array',
              items: Recipient.response,
            },
          },
        },
      },
    },
  },
};
