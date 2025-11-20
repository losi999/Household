import { faker } from '@faker-js/faker';
import { CalendarGridRowsPipe } from '@household/web/app/hairdressing/calendar/pipes/calendar-grid-rows.pipe';

describe('CalendarGridRowsPipe', () => {
  let pipe: CalendarGridRowsPipe;
  let hour: number;
  
  beforeEach(() => {
    pipe = new CalendarGridRowsPipe();

    hour = faker.number.int({
      min: 0,
      max: 23,
    });
  });

  it('should display the full grid', () => {
    const result = pipe.transform({
      start: 0,
      end: 96,
    });

    expect(result).toMatch(/repeat\(96, \d+px\)/);
  });

  it('should NOT round xx:00 as starting time, hide leading rows', () => {
    const hour00Index = hour * 4;
    
    const result = pipe.transform({
      start: hour00Index,
      end: 96,
    });

    if (hour00Index > 0) {
      expect(result).toMatch(new RegExp(`^repeat\\(${hour00Index}, auto\\)`));
    }
    expect(result).toMatch(new RegExp(`repeat\\(${96 - hour00Index}, \\d+px\\)`));
  });

  it('should NOT round xx:30 as starting time, hide leading rows', () => {
    const hour30Index = hour * 4 + 2;
    
    const result = pipe.transform({
      start: hour30Index,
      end: 96,
    });

    expect(result).toMatch(new RegExp(`^repeat\\(${hour30Index}, auto\\)`));  
    expect(result).toMatch(new RegExp(`repeat\\(${96 - hour30Index}, \\d+px\\)`));
  });

  it('should NOT round xx:00 as ending time, hide trailing rows', () => {
    const hour00Index = hour * 4;
    
    const result = pipe.transform({
      start: 0,
      end: hour00Index,
    });

    expect(result).toMatch(new RegExp(`repeat\\(${hour00Index}, \\d+px\\)`));
    expect(result).toMatch(new RegExp(`repeat\\(${96 - hour00Index}, auto\\)$`));  
  });

  it('should NOT round xx:30 as ending time, hide trailing rows', () => {
    const hour30Index = hour * 4 + 2;
    
    const result = pipe.transform({
      start: 0,
      end: hour30Index,
    });

    expect(result).toMatch(new RegExp(`repeat\\(${hour30Index}, \\d+px\\)`));
    expect(result).toMatch(new RegExp(`repeat\\(${96 - hour30Index}, auto\\)$`));  
  });

  it('should round xx:45 down to xx:30 as starting time, hide leading rows', () => {
    const hour45Index = hour * 4 + 3;
    const hour30Index = hour * 4 + 2;
    
    const result = pipe.transform({
      start: hour45Index,
      end: 96,
    });
    
    expect(result).toMatch(new RegExp(`^repeat\\(${hour30Index}, auto\\)`));  
    expect(result).toMatch(new RegExp(`repeat\\(${96 - hour30Index}, \\d+px\\)`));
  });

  it('should round xx:15 down to xx:00 as starting time, hide leading rows', () => {
    const hour15Index = hour * 4 + 1;
    const hour00Index = hour * 4;
    
    const result = pipe.transform({
      start: hour15Index,
      end: 96,
    });
    
    if (hour00Index > 0) {
      expect(result).toMatch(new RegExp(`^repeat\\(${hour00Index}, auto\\)`));
    }
    expect(result).toMatch(new RegExp(`repeat\\(${96 - hour00Index}, \\d+px\\)`));
  });

  it('should round xx:45 up to xx:00 as ending time, hide trailing rows', () => {
    hour = 23;
    const hour45Index = hour * 4 + 3;
    const hour00Index = (hour + 1) * 4;
    
    const result = pipe.transform({
      start: 0,
      end: hour45Index,
    });

    expect(result).toMatch(new RegExp(`repeat\\(${hour00Index}, \\d+px\\)`));
    if (hour00Index < 96) {
      expect(result).toMatch(new RegExp(`repeat\\(${96 - hour00Index}, auto\\)$`));  
    }
  });

  it('should round xx:15 up to xx:30 as ending time, hide trailing rows', () => {
    const hour15Index = hour * 4 + 1;
    const hour30Index = hour * 4 + 2;
    
    const result = pipe.transform({
      start: 0,
      end: hour15Index,
    });

    expect(result).toMatch(new RegExp(`repeat\\(${hour30Index}, \\d+px\\)`));
    expect(result).toMatch(new RegExp(`repeat\\(${96 - hour30Index}, auto\\)$`));  
  });
});
