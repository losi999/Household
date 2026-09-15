import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { default as file } from '@household/test/schemas/file-response';

const schema: StrictJSONSchema7<Responses.File[]> = {
  type: 'array',
  items: file,
};

export default schema;
