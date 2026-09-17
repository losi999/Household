import * as Setting from '@household/shared/schemas/setting';
import { createPath } from '@household/shared/common/schema-utils';

export const updateSetting = createPath({
  method: 'post',
  tags: ['Setting'],
  parameters: [
    {
      in: 'path',
      name: 'settingKey',
      schema: Setting.settingKey.properties.settingKey,
    },
  ],
  requestBodySchema: Setting.request,
  response: {
    statusCode: 204,
    description: 'Setting updated',
  },
});
