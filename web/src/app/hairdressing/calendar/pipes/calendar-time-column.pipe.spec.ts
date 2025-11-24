import { faker } from '@faker-js/faker';
import { CalendarTimeColumnPipe } from '@household/web/app/hairdressing/calendar/pipes/calendar-time-column.pipe';

describe('CalendarTimeColumnPipe', () => {
  let pipe: CalendarTimeColumnPipe;
  let hour: number;

  beforeEach(() => {
    pipe = new CalendarTimeColumnPipe();
    hour = faker.number.int({
      min: 0,
      max: 23,
    });
  });

  it('should ALWAYS set times of xx:15 and xx:45 to undefined', () => {
    const start = faker.number.int({
      min: 0,
      max: 95,
    });
    const result = pipe.transform({
      start,
      end: faker.number.int({
        min: start,
        max: 96,
      }),
    });

    for (let i = 1; i < result.length ;i += 2) {
      expect(result[i]).toBeUndefined();
    }
  });

  it('should NOT round xx:00 as starting time', () => {
    const hour00Index = hour * 4;
    
    const result = pipe.transform({
      start: hour00Index,
      end: 96,
    });

    expect(result[hour00Index]).toEqual(`${hour}:00`);

    for (let i = 0; i < result.length; i += 1) {
      if (i < hour00Index) {
        expect(result[i]).toBeUndefined();
      } else { 
        if (i % 2 === 0) {
          expect(result[i]).toBeDefined();
        } else {
          expect(result[i]).toBeUndefined();
        }
      }
    }
  });

  it('should NOT round xx:30 as starting time', () => {
    const hour30Index = hour * 4 + 2;
    
    const result = pipe.transform({
      start: hour30Index,
      end: 96,
    });

    expect(result[hour30Index]).toEqual(`${hour}:30`);

    for (let i = 0; i < result.length; i += 1) {
      if (i < hour30Index) {
        expect(result[i]).toBeUndefined();
      } else { 
        if (i % 2 === 0) {
          expect(result[i]).toBeDefined();
        } else {
          expect(result[i]).toBeUndefined();
        }
      }
    }
  });

  it('should NOT round xx:00 as ending time', () => {
    const hour00Index = hour * 4;
    
    const result = pipe.transform({
      start: 0,
      end: hour00Index,
    });

    expect(result[hour00Index]).toEqual(`${hour}:00`);

    for (let i = 0; i < result.length; i += 1) {
      if (i > hour00Index) {
        expect(result[i]).toBeUndefined();
      } else { 
        if (i % 2 === 0) {
          expect(result[i]).toBeDefined();
        } else {
          expect(result[i]).toBeUndefined();
        }
      }
    }
  });

  it('should NOT round xx:30 as ending time', () => {
    const hour30Index = hour * 4 + 2;
    
    const result = pipe.transform({
      start: 0,
      end: hour30Index,
    });

    expect(result[hour30Index]).toEqual(`${hour}:30`);

    for (let i = 0; i < result.length; i += 1) {
      if (i > hour30Index) {
        expect(result[i]).toBeUndefined();
      } else { 
        if (i % 2 === 0) {
          expect(result[i]).toBeDefined();
        } else {
          expect(result[i]).toBeUndefined();
        }
      }
    }
  });

  it('should round xx:45 down to xx:30 as starting time', () => {
    const hour45Index = hour * 4 + 3;
    const hour30Index = hour * 4 + 2;
    
    const result = pipe.transform({
      start: hour45Index,
      end: 96,
    });

    expect(result[hour30Index]).toEqual(`${hour}:30`);

    for (let i = 0; i < result.length; i += 1) {
      if (i < hour30Index) {
        expect(result[i]).toBeUndefined();
      } else { 
        if (i % 2 === 0) {
          expect(result[i]).toBeDefined();
        } else {
          expect(result[i]).toBeUndefined();
        }
      }
    }
  });

  it('should round xx:15 down to xx:00 as starting time', () => {
    const hour15Index = hour * 4 + 1;
    const hour00Index = hour * 4;

    const result = pipe.transform({
      start: hour15Index,
      end: 96,
    });

    expect(result[hour00Index]).toEqual(`${hour}:00`);

    for (let i = 0; i < result.length; i += 1) {
      if (i < hour00Index) {
        expect(result[i]).toBeUndefined();
      } else { 
        if (i % 2 === 0) {
          expect(result[i]).toBeDefined();
        } else {
          expect(result[i]).toBeUndefined();
        }
      }
    }
  });

  it('should round xx:45 up to xx:00 as ending time', () => {
    const hour45Index = hour * 4 + 3;
    const hour00Index = (hour + 1) * 4;
    
    const result = pipe.transform({
      start: 0,
      end: hour45Index,
    });

    if (hour00Index < result.length) { 
      expect(result[hour00Index]).toEqual(`${hour + 1}:00`);
    }

    for (let i = 0; i < result.length; i += 1) {
      if (i > hour00Index) {
        expect(result[i]).toBeUndefined();
      } else { 
        if (i % 2 === 0) {
          expect(result[i]).toBeDefined();
        } else {
          expect(result[i]).toBeUndefined();
        }
      }
    }
  });

  it('should round xx:15 up to xx:30 as ending time', () => {
    const hour15Index = hour * 4 + 1;
    const hour30Index = hour * 4 + 2;
    
    const result = pipe.transform({
      start: 0,
      end: hour15Index,
    });

    expect(result[hour30Index]).toEqual(`${hour}:30`);

    for (let i = 0; i < result.length; i += 1) {
      if (i > hour30Index) {
        expect(result[i]).toBeUndefined();
      } else { 
        if (i % 2 === 0) {
          expect(result[i]).toBeDefined();
        } else {
          expect(result[i]).toBeUndefined();
        }
      }
    }
  });
});
