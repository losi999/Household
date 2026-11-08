import { MinutesToHourPipe } from './minutes-to-hour-pipe';

describe('MinutesToHourPipe', () => {
  const pipe = new MinutesToHourPipe();

  it.each([
    [
      0,
      '0:00',
    ],
    [
      65,
      '1:05',
    ],
    [
      120,
      '2:00',
    ],
    [
      1500,
      '25:00',
    ],
  ])('should convert %s minutes to %s', (totalMinutes, time) => {
    expect(pipe.transform(totalMinutes)).toBe(time);
  });
});
