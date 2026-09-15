import { PathItemObject } from 'openapi3-ts/oas32';
import * as File from '@household/shared/schemas/file';

export const createUploadUrl: PathItemObject = {
  post: {
    tags: ['File'],
    requestBody: {
      content: {
        'application/json': {
          schema: File.request,
        },
      },
    },
    responses: {
      201: {
        description: 'File created, upload URL returned',
        content: {
          'application/json': {
            schema: File.uploadUrl,
          },
        },
      },
    },
  },
};
