import { StrictJSONSchema7 } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { default as settingKey } from '@household/shared/schemas/setting-key';
import { default as setting } from '@household/shared/schemas/setting-request';

const schema: StrictJSONSchema7<Responses.Setting> = {
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
