import { calendarEntryId as schema } from '@household/shared/schemas/calendar-entry';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Api } from '@household/shared/types/api';
import { schemaTesterFactory } from '@household/shared/common/schema-utils';

describe('Calendar entry id schema', () => {
  const tester = schemaTesterFactory<Api.Calendar.Entry.CalendarEntryId>(schema);

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
