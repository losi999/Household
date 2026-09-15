import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { default as setting } from '@household/test/schemas/setting-response';

const schema: StrictJSONSchema7<Responses.Setting[]> = {
  type: 'array',
  items: setting,
};

export default schema;
