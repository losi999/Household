import * as Recipient from '@household/shared/schemas/recipient';
import { createPath } from '@household/shared/common/schema-utils';

export const getRecipient = createPath({
  method: 'get',
  tags: ['Recipient'],
  parameters: [
    {
      in: 'path',
      name: 'recipientId',
      schema: Recipient.recipientId.properties.recipientId,
    },
  ],
  response: {
    statusCode: 200,
    description: 'Recipient',
    schema: Recipient.response,
  },
});
