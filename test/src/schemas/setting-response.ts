import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Setting } from '@household/shared/types/types';
import { default as settingKey } from '@household/shared/schemas/setting-key';
import { default as setting } from '@household/shared/schemas/setting-request';

const schema: StrictJSONSchema7<Setting.Response> = {
  type: 'object',
  additionalProperties: false,
  required: [
    ...settingKey.required,
    ...setting.required,
  ],
  properties: {
    ...settingKey.properties,
    ...setting.properties,
  },
};

export default schema;
