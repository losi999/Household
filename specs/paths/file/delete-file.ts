import { PathItemObject } from 'openapi3-ts/oas32';
import * as File from '@household/shared/schemas/file';

export const deleteFile: PathItemObject = {
  delete: {
    tags: ['File'],
    parameters: [
      {
        name: 'fileId',
        in: 'path',
        required: true,
        schema: File.fileId.properties.fileId,
      },
    ],
    responses: {
      204: {
        description: 'File deleted',
      },
    },
  },
};
