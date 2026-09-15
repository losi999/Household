import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { default as mongoId } from '@household/shared/schemas/partials/mongo-id';

/** @deprecated */
const schema: StrictJSONSchema7<Api.File.FileId> = {
  type: 'object',
  additionalProperties: false,
  required: ['fileId'],
  properties: {
    fileId: mongoId,
  },
};

export default schema;
