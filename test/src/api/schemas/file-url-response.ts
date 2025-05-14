import { StrictJSONSchema7 } from '@household/shared/types/common';
import { File } from '@household/shared/types/types';
import { default as fileId } from '@household/shared/schemas/file-id';

const schema: StrictJSONSchema7<File.Url & File.FileId> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...fileId.required,
    'url',
  ],
  properties: {
    ...fileId.properties,
    url: {
      type: 'string',
      format: 'url',
    },
  },
};

export default schema;
