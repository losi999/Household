import { StrictJSONSchema7 } from '@household/shared/types/common';
import { File } from '@household/shared/types/types';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

const schema: StrictJSONSchema7<File.FileId> = {
  type: 'object',
  additionalProperties: false,
  required: ['fileId'],
  properties: {
    fileId: mongoId,
  },
};

export default schema;
