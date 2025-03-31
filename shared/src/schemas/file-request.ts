import { fileTypes } from '@household/shared/constants';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { File } from '@household/shared/types/types';

const schema: StrictJSONSchema7<File.Request> = {
  type: 'object',
  additionalProperties: false,
  required: ['fileType'],
  properties: {
    fileType: {
      type: 'string',
      enum: [...fileTypes],
    },
    timezone: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default schema;
