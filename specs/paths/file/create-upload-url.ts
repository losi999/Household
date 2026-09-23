import * as File from '@household/shared/schemas/file';
import { createPath } from '@household/shared/common/schema-utils';

export const createUploadUrl = createPath({
  method: 'post',
  tags: ['File'],
  requestBodySchema: File.request,
  response: {
    statusCode: 201,
    description: 'File created, upload URL returned',
    schema: File.uploadUrl,
  },
});
