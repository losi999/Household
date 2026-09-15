import { PathItemObject } from 'openapi3-ts/oas32';
import * as Recipient from '@household/shared/schemas/recipient';

export const updateRecipient: PathItemObject = {
  put: {
    tags: ['Recipient'],
    parameters: [
      {
        name: 'recipientId',
        in: 'path',
        required: true,
        schema: Recipient.recipientId.properties.recipientId,
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: Recipient.request,
        },
      },
    },
    responses: {
      201: {
        description: 'Recipient updated',
        content: {
          'application/json': {
            schema: Recipient.recipientId,
          },
        },
      },
    },
  },
};
