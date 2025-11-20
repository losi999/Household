import { testDataFactory } from '@household/shared/common/test-data-factory';
import { PastEntriesPipe } from '@household/web/app/hairdressing/customer/pipes/past-entries.pipe';

describe('PastEntriesPipe', () => {
  let pipe: PastEntriesPipe;

  beforeEach(() => {
    pipe = new PastEntriesPipe();
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

    expect(result).toEqual([pastEntry]);
  });
});
