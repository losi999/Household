import { FileType } from '@household/shared/enums';
import { StrictJSONSchema7 } from '@household/shared/types/common';
import { File } from '@household/shared/types/types';

const schema: StrictJSONSchema7<File.Request> = {
  type: 'object',
  additionalProperties: false,
  required: [
    'fileType',
    'timezone',
  ],
  properties: {
    fileType: {
      type: 'string',
      enum: Object.values(FileType),
    },
    timezone: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default schema;
