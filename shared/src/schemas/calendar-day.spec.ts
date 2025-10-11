import { default as schema } from '@household/shared/schemas/calendar-day';
import { Calendar } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';

describe('Calendar day schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.DayProp>(schema);
  const day = '2025-10-10';
  tester.validateSuccess({
    day,
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        day,
        extra: 1,
      } as any, 'data');
    });

    describe('if data.day', () => {
      tester.required({
        day: undefined,
      }, 'day');

      tester.type({
        day: 1 as any,
      }, 'day', 'string');

      tester.format({
        day: 'not-a-date',
      }, 'day', 'date');
    });
  });
});
