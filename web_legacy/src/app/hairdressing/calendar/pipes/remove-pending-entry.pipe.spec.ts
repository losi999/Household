import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Calendar } from '@household/shared/types/types';
import { RemovePendingEntryPipe } from '@household/web/app/hairdressing/calendar/pipes/remove-pending-entry.pipe';
import { LimitedCalendarDay } from '@household/web/types/common';
import { dayLimitTestCases } from '@household/web/utils/constant-test-data';

describe('RemovePendingEntryPipe', () => {
  let pipe: RemovePendingEntryPipe;
  let day: LimitedCalendarDay;
  let pendingCalendarEntryId: Calendar.Entry.Id;

  beforeEach(() => {
    pipe = new RemovePendingEntryPipe();

    pendingCalendarEntryId = testDataFactory.calendar.entry.id();
  });

  it('should return day unchanged if pending calendar entry is not in it', () => {
    day = {
      ...testDataFactory.calendar.day.response.workday(),
      calculatedStart: undefined,
      calculatedEnd: undefined,
    };

    const result = pipe.transform(day, pendingCalendarEntryId);
    expect(result).toEqual(day);
  });

  describe('should remove entry from day', () => {
    dayLimitTestCases.forEach(({ earliestStart, latestEnd, plannedStart, plannedEnd, calculatedStart, calculatedEnd }, index) => {
      it(`and recalculate day limits #${index + 1}: ${earliestStart}-${latestEnd} ${plannedStart}-${plannedEnd} -> ${calculatedStart}-${calculatedEnd}`, () => {
        const pendingCalendarEntry = testDataFactory.calendar.entry.response.work({
          calendarEntryId: pendingCalendarEntryId,
        });
        const earliestEntry = testDataFactory.calendar.entry.response.work({
          start: earliestStart,
          end: earliestStart + 1,
        });

        const latestEntry = testDataFactory.calendar.entry.response.work({
          start: latestEnd - 1,
          end: latestEnd,
        });

        day = {
          ...testDataFactory.calendar.day.response.workday({
            start: plannedStart,
            end: plannedEnd,
            entries: [
              pendingCalendarEntry,
              earliestEntry,
              latestEntry,
            ],
          }),
          calculatedEnd: undefined,
          calculatedStart: undefined,
        };

        const result = pipe.transform(day, pendingCalendarEntryId);
        expect(result).toEqual({
          ...day,
          entries: [
            earliestEntry, 
            latestEntry,
          ],
          calculatedStart,
          calculatedEnd,
        });
      });
    });
  });
});
