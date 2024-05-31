import { StrictJSONSchema7 } from '@household/shared/types/common';

const schema: StrictJSONSchema7<string> = {
  type: 'string',
  pattern: '^[a-zA-Z0-9]{24}$',
};

export default schema;
