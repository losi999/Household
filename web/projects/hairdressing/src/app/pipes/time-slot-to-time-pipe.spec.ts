import { TimeSlotToTimePipe } from './time-slot-to-time-pipe';

describe('TimeSlotToTimePipe', () => {
  const pipe = new TimeSlotToTimePipe();

  it.each([
    [
      0,
      '0:00',
    ],
    [
      5,
      '1:15',
    ],
    [
      36,
      '9:00',
    ],
  ])('should convert time slot %s to %s', (timeSlot, time) => {
    expect(pipe.transform(timeSlot)).toBe(time);
  });
});
