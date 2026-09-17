import { draftResponse } from '@household/shared/schemas/transaction';
import { createPath } from '@household/shared/common/schema-utils';
import { fileId } from '@household/shared/schemas/file';

export const listTransactionsByFile = createPath({
  method: 'get',
  tags: ['Transaction'],
  parameters: [
    {
      name: 'fileId',
      in: 'path',
      schema: fileId.properties.fileId,
    },
  ],
  response: {
    statusCode: 200,
    description: 'List of draft transactions',
    schema: {
      type: 'array',
      items: draftResponse,
    },
  },
});
