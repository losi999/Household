import { createPath } from '@household/shared/common/schema-utils';
import { calendarEntryId, response } from '@household/shared/schemas/calendar-entry';

export const getCalendarEntry = createPath({
  method: 'get',
  tags: ['Calendar'],
  parameters: [
    {
      in: 'path',
      name: 'calendarEntryId',
      schema: calendarEntryId.properties.calendarEntryId,
    },
  ],
  response: {
    statusCode: 200,
    description: 'Calendar entry',
    schema: response,
  },
});
