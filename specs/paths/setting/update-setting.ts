import { PathItemObject } from 'openapi3-ts/oas32';
import * as Setting from '@household/shared/schemas/setting';

export const updateSetting: PathItemObject = {
  post: {
    tags: ['Setting'],
    parameters: [
      {
        name: 'settingKey',
        in: 'path',
        required: true,
        schema: Setting.settingKey.properties.settingKey,
      },
    ],
    requestBody: {
      content: {
        'application/json': {
          schema: Setting.request,
        },
      },
    },
    responses: {
      204: {
        description: 'Setting updated',
      },
    },
  },
};
