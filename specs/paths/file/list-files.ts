import * as File from '@household/shared/schemas/file';
import { createPath } from '@household/shared/common/schema-utils';

export const listFiles = createPath({
  method: 'get',
  tags: ['File'],
  response: {
    statusCode: 200,
    description: 'List of files',
    schema: File.responseList,
  },
});
