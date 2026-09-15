import { PathItemObject } from 'openapi3-ts/oas32';
import * as Recipient from '@household/shared/schemas/recipient';

export const deleteRecipient: PathItemObject = {
  delete: {
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
      204: {
        description: 'Recipient deleted',
      },
    },
  },
};
