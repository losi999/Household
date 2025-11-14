import { testDataFactory } from '@household/shared/common/test-data-factory';
import { Calendar, Customer } from '@household/shared/types/types';
import { EntryWarningsPipe } from '@household/web/app/hairdressing/calendar/pipes/entry-warnings.pipe';

describe('EntryWarningsPipe', () => {
  let pipe: EntryWarningsPipe;
  let calendarDay: Calendar.Day.Response;
  let calendarEntry: Calendar.Entry.Response;
  let job: Customer.Job.Response;
  let duration: number;

  beforeEach(() => {
    pipe = new EntryWarningsPipe();

    calendarEntry = testDataFactory.calendar.entry.response.work();
    duration = 4;
    job = testDataFactory.customer.job.response({
      duration: duration - 1,
    });
  });

  it('should return duration too short message', () => {
    calendarDay = testDataFactory.calendar.day.response.workday();
    
    const result = pipe.transform({
      duration: 1,
      job,
      start: undefined,
    }, calendarDay, calendarEntry);
    
    expect(result).toContain('Időtartam kevesebb, mint a munkához rögzített');
  });

  it('should return vacation message', () => {
    calendarDay = testDataFactory.calendar.day.response.vacation();

    const result = pipe.transform({
      duration,
      job,
      start: undefined,
    }, calendarDay, calendarEntry);
    
    expect(result).toContain('Ezt a napot szabadságnak jelölted');
  });

  it('should return holiday message', () => {
    calendarDay = testDataFactory.calendar.day.response.holiday();

    const result = pipe.transform({
      duration,
      job,
      start: undefined,
    }, calendarDay, calendarEntry);
    
    expect(result).toContain('Munkaszüneti nap');
  });

  it('should return weekend message', () => {
    calendarDay = testDataFactory.calendar.day.response.weekend();

    const result = pipe.transform({
      duration,
      job,
      start: undefined,
    }, calendarDay, calendarEntry);
    
    expect(result).toContain('Hétvége');
  });

  it('should return overtime message for too early entry', () => {
    calendarDay = testDataFactory.calendar.day.response.workday({
      start: 30,
      end: 96,
    });
    
    const result = pipe.transform({
      duration,
      job,
      start: 25,
    }, calendarDay, calendarEntry);
    
    expect(result).toContain('Túlóra');
  });

  it('should return overtime message for too late entry', () => {
    calendarDay = testDataFactory.calendar.day.response.workday({
      start: 0,
      end: 50,
    });
    
    const result = pipe.transform({
      duration,
      job,
      start: 55,
    }, calendarDay, calendarEntry);
    
    expect(result).toContain('Túlóra');
  });

  it('should return overlap message (personal entry)', () => {
    const overlappingEntry = testDataFactory.calendar.entry.response.personal({
      start: 30,
      end: 34,
    });
    calendarDay = testDataFactory.calendar.day.response.workday({
      start: 0,
      end: 96,
      entries: [overlappingEntry],
    });
    
    const result = pipe.transform({
      duration,
      job,
      start: 32,
    }, calendarDay, calendarEntry);
    
    expect(result).toContain(`Ütközik az alábbi személyes programmal: ${overlappingEntry.title}`);
  });

  it('should return overlap message (work entry)', () => {
    const overlappingEntry = testDataFactory.calendar.entry.response.work({
      start: 30,
      end: 34,
    });
    calendarDay = testDataFactory.calendar.day.response.workday({
      start: 0,
      end: 96,
      entries: [overlappingEntry],
    });
    
    const result = pipe.transform({
      duration,
      job,
      start: 32,
    }, calendarDay, calendarEntry);
    
    expect(result).toContain(`Ütközik az alábbi munkával: ${overlappingEntry.title}`);
  });

  it('should return overlap message (issue entry)', () => {
    const overlappingEntry = testDataFactory.calendar.entry.response.issue({
      start: 30,
      end: 34,
    });
    calendarDay = testDataFactory.calendar.day.response.workday({
      start: 0,
      end: 96,
      entries: [overlappingEntry],
    });
    
    const result = pipe.transform({
      duration,
      job,
      start: 32,
    }, calendarDay, calendarEntry);
    
    expect(result).toContain(`Ütközik az alábbi problémával: ${overlappingEntry.title}`);
  });
});
