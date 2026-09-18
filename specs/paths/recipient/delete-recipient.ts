import * as Recipient from '@household/shared/schemas/recipient';
import { createPath } from '@household/shared/common/schema-utils';

export const deleteRecipient = createPath({
  method: 'delete',
  tags: ['Recipient'],
  parameters: [
    {
      in: 'path',
      name: 'recipientId',
      schema: Recipient.recipientId.properties.recipientId,
    },
  ],
  response: {
    statusCode: 204,
    description: 'Recipient deleted',
  },
});
