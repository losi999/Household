import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { default as fileId } from '@household/shared/schemas/file-id';

const schema: StrictJSONSchema7<Api.File.Url & Api.File.FileId> = {
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
