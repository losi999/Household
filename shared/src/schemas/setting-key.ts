import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';

/** @deprecated */
const schema: StrictJSONSchema7<Api.Setting.SettingKey> = {
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
