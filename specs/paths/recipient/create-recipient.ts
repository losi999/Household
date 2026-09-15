import { PathItemObject } from 'openapi3-ts/oas32';
import * as Recipient from '@household/shared/schemas/recipient';

export const createRecipient: PathItemObject = {
  post: {
    tags: ['Recipient'],
    requestBody: {
      content: {
        'application/json': {
          schema: Recipient.request,
        },
      },
    },
    responses: {
      201: {
        description: 'Recipient created',
        content: {
          'application/json': {
            schema: Recipient.recipientId,
          },
        },
      },
    },
  },
};
