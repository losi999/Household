import { StrictJSONSchema7 } from '@household/shared/types/common';
import { File } from '@household/shared/types/types';
import { default as file } from '@household/test/api/schemas/file-response';

const schema: StrictJSONSchema7<File.Response[]> = {
  type: 'array',
  items: file,
};

export default schema;
