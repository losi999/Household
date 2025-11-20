import { testDataFactory } from '@household/shared/common/test-data-factory';
import { UpcomingEntriesPipe } from '@household/web/app/hairdressing/customer/pipes/upcoming-entries.pipe';

describe('UpcomingEntriesPipe', () => {
  let pipe: UpcomingEntriesPipe;

  beforeEach(() => {
    pipe = new UpcomingEntriesPipe();
  });

  it('should return filtered entries', () => {
    const pastEntry = testDataFactory.calendar.entry.response.workBase({
      day: testDataFactory.calendar.day.pastDay(),
    });
    const futureEntry = testDataFactory.calendar.entry.response.workBase({
      day: testDataFactory.calendar.day.futureDay(),
    });

    const result = pipe.transform([
      futureEntry,
      pastEntry,
    ]);

    expect(result).toEqual([futureEntry]);
  });
});
