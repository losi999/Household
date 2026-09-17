import * as Setting from '@household/shared/schemas/setting';
import { createPath } from '@household/shared/common/schema-utils';

export const listSettings = createPath({
  method: 'get',
  tags: ['Setting'],
  response: {
    statusCode: 200,
    description: 'List of settings',
    schema: Setting.responseList,
  },
});
