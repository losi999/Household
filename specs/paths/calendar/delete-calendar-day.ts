import { createPath } from '@household/shared/common/schema-utils';
import { day } from '@household/shared/schemas/calendar';

export const deleteCalendarDay = createPath({
  method: 'delete',
  tags: ['Calendar'],
  parameters: [
    {
      in: 'path',
      name: 'day',
      schema: day.properties.day,
    },
  ],
  response: {
    statusCode: 204,
    description: 'Day reset to default',
  },
});
