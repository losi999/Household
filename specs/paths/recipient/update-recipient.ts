import * as Recipient from '@household/shared/schemas/recipient';
import { createPath } from '@household/shared/common/schema-utils';

export const updateRecipient = createPath({
  method: 'put',
  tags: ['Recipient'],
  parameters: [
    {
      in: 'path',
      name: 'recipientId',
      schema: Recipient.recipientId.properties.recipientId,
    },
  ],
  requestBodySchema: Recipient.request,
  response: {
    statusCode: 204,
    description: 'Recipient updated',
  },
});
