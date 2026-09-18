import * as Recipient from '@household/shared/schemas/recipient';
import { createPath } from '@household/shared/common/schema-utils';

export const listRecipients = createPath({
  method: 'get',
  tags: ['Recipient'],
  response: {
    statusCode: 200,
    description: 'List of recipients',
    schema: Recipient.responseList,
  },
});
