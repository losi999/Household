import * as File from '@household/shared/schemas/file';
import { createPath } from '@household/shared/common/schema-utils';

export const deleteFile = createPath({
  method: 'delete',
  tags: ['File'],
  parameters: [
    {
      in: 'path',
      name: 'fileId',
      schema: File.fileId.properties.fileId,
    },
  ],
  response: {
    statusCode: 204,
    description: 'File deleted',
  },
});
