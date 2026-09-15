import { PathItemObject } from 'openapi3-ts/oas32';
import * as Recipient from '@household/shared/schemas/recipient';

export const mergeRecipients: PathItemObject = {
  post: {
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
          schema: Recipient.idList,
        },
      },
    },
    responses: {
      201: {
        description: 'Recipients merged',
        content: {
          'application/json': {
            schema: Recipient.recipientId,
          },
        },
      },
    },
  },
};
