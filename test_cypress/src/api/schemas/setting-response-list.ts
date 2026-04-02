import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Setting } from '@household/shared/types/types';
import { default as setting } from '@household/test/api/schemas/setting-response';

const schema: StrictJSONSchema7<Setting.Response[]> = {
  type: 'array',
  items: setting,
};

export default schema;
