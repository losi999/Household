import { createPath } from '@household/shared/common/schema-utils';
import { calendarEntryId, request } from '@household/shared/schemas/calendar-entry';

export const updateCalendarEntry = createPath({
  method: 'put',
  tags: ['Calendar'],
  parameters: [
    {
      in: 'path',
      name: 'calendarEntryId',
      schema: calendarEntryId.properties.calendarEntryId,
    },
  ],
  requestBodySchema: request,
  response: {
    statusCode: 201,
    description: 'Calendar entry updated',
    schema: calendarEntryId,
  },
});
