import { faker } from '@faker-js/faker';
import { DaysOfWeekPipe } from '@household/web/app/hairdressing/calendar/pipes/days-of-week.pipe';

describe('DaysOfWeekPipe', () => {
  let pipe: DaysOfWeekPipe;
  beforeEach(() => {
    pipe = new DaysOfWeekPipe();
  });

  it('should return seven consecutive days', () => {
    const start = faker.date.anytime();

    const result = pipe.transform(start);

    const dayDiffInMs = 24 * 60 * 60 * 1000;
  
    expect(result[6].getTime() - result[0].getTime()).toEqual(6 * dayDiffInMs);
    for(let i = 1; i < 7; i += 1) {
      expect(result[i].getTime() - result[i - 1].getTime()).toEqual(dayDiffInMs);  
    }
  });
});
