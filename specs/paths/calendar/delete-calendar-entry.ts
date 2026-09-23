import { createPath } from '@household/shared/common/schema-utils';
import { calendarEntryId } from '@household/shared/schemas/calendar-entry';

export const deleteCalendarEntry = createPath({
  method: 'delete',
  tags: ['Calendar'],
  parameters: [
    {
      in: 'path',
      name: 'calendarEntryId',
      schema: calendarEntryId.properties.calendarEntryId,
    },
  ],
  response: {
    statusCode: 204,
    description: 'Calendar entry deleted',
  },
});
