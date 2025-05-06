import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Setting } from '@household/shared/types/types';

const schema: StrictJSONSchema7<Setting.SettingKey> = {
  type: 'object',
  additionalProperties: false,
  required: ['settingKey'],
  properties: {
    settingKey: {
      type: 'string',
      minLength: 1,
    },
  },
};

export default schema;
