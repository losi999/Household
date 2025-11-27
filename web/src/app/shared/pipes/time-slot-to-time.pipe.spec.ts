import { TimeSlotToTimePipe } from './time-slot-to-time.pipe';

describe.skip('TimeSlotToTimePipe', () => {
  it('create an instance', () => {
    const pipe = new TimeSlotToTimePipe();
    expect(pipe).toBeTruthy();
  });
});
