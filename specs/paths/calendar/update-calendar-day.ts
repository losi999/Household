import { createPath } from '@household/shared/common/schema-utils';
import { day } from '@household/shared/schemas/calendar';
import { request } from '@household/shared/schemas/calendar-day';

export const updateCalendarDay = createPath({
  method: 'put',
  tags: ['Calendar'],
  parameters: [
    {
      in: 'path',
      name: 'day',
      schema: day.properties.day,
    },
  ],
  requestBodySchema: request,
  response: {
    statusCode: 204,
    description: 'Calendar day updated',
  },
});
