import * as Recipient from '@household/shared/schemas/recipient';
import { createPath } from '@household/shared/common/schema-utils';

export const mergeRecipients = createPath({
  method: 'post',
  tags: ['Recipient'],
  parameters: [
    {
      in: 'path',
      name: 'recipientId',
      schema: Recipient.recipientId.properties.recipientId,
    },
  ],
  requestBodySchema: Recipient.idList,
  response: {
    statusCode: 201,
    description: 'Recipients merged',
    schema: Recipient.recipientId,
  },
});
