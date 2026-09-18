import { createPath } from '@household/shared/common/schema-utils';
import { responseList } from '@household/shared/schemas/calendar-day';
import { dateRange } from '@household/shared/schemas/calendar';

export const listCalendarDays = createPath({
  method: 'get',
  tags: ['Calendar'],
  parameters: [
    {
      in: 'query',
      name: 'dateFrom',
      schema: dateRange.properties.dateFrom,
    },
    {
      in: 'query',
      name: 'dateTo',
      schema: dateRange.properties.dateTo,
    },
  ],
  response: {
    statusCode: 200,
    description: 'List of calendar days',
    schema: responseList,
  },
});
