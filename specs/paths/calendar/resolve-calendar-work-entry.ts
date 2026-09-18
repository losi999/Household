import { createPath } from '@household/shared/common/schema-utils';
import { calendarEntryId, resolutionRequest } from '@household/shared/schemas/calendar-entry';
import { transactionId } from '@household/shared/schemas/transaction';

export const resolveCalendarWorkEntry = createPath({
  method: 'post',
  tags: ['Calendar'],
  parameters: [
    {
      in: 'path',
      name: 'calendarEntryId',
      schema: calendarEntryId.properties.calendarEntryId,
    },
  ],
  requestBodySchema: resolutionRequest,
  response: {
    statusCode: 201,
    description: 'Created transaction id',
    schema: transactionId,
  },
});
