import { PathItemObject } from 'openapi3-ts/oas32';
import * as Recipient from '@household/shared/schemas/recipient';

export const getRecipient: PathItemObject = {
  get: {
    tags: ['Recipient'],
    parameters: [
      {
        name: 'recipientId',
        in: 'path',
        required: true,
        schema: Recipient.recipientId.properties.recipientId,
      },
    ],
    responses: {
      200: {
        description: 'Recipient',
        content: {
          'application/json': {
            schema: Recipient.response,
          },
        },
      },
    },
  },
};
