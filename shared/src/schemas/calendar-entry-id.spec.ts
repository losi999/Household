import { default as schema } from '@household/shared/schemas/calendar-entry-id';
import { Calendar } from '@household/shared/types/types';
import { jsonSchemaTesterFactory } from '@household/shared/common/json-schema-tester';
import { testDataFactory } from '@household/shared/common/test-data-factory';

describe('Calendar entry id schema', () => {
  const tester = jsonSchemaTesterFactory<Calendar.Entry.CalendarEntryId>(schema);

  tester.validateSuccess({
    calendarEntryId: testDataFactory.calendar.entry.id(),
  });

  describe('should deny', () => {
    describe('if data', () => {
      tester.additionalProperties({
        calendarEntryId: testDataFactory.calendar.entry.id(),
        extra: 1,
      } as any, 'data');
    });

    describe('if data.calendarEntryId', () => {
      tester.required({
        calendarEntryId: undefined,
      }, 'calendarEntryId');

      tester.type({
        calendarEntryId: 1 as any,
      }, 'calendarEntryId', 'string');

      tester.pattern({
        calendarEntryId: testDataFactory.calendar.entry.id('not-valid'),
      }, 'calendarEntryId');
    });
  });
});
