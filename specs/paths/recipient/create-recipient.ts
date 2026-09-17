import * as Recipient from '@household/shared/schemas/recipient';
import { createPath } from '@household/shared/common/schema-utils';

export const createRecipient = createPath({
  method: 'post',
  tags: ['Recipient'],
  requestBodySchema: Recipient.request,
  response: {
    statusCode: 201,
    description: 'Recipient created',
    schema: Recipient.recipientId,
  },
});
