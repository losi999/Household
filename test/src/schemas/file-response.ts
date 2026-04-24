import { StrictJSONSchema7 } from '@household/shared/types/common';
import { File } from '@household/shared/types/types';
import { default as fileId } from '@household/shared/schemas/file-id';
import { default as file } from '@household/shared/schemas/file-request';

const schema: StrictJSONSchema7<File.Response> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...fileId.required,
    'draftCount',
    'uploadedAt',
    'fileType',
  ],
  properties: {
    ...fileId.properties,
    fileType: {
      ...file.properties.fileType,
    },
    draftCount: {
      type: 'integer',
      minimum: 0,
    },
    uploadedAt: {
      type: 'string',
      format: 'date-time',
    },
  },
};

export default schema;
