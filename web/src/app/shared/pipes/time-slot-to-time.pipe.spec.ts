import { TimeSlotToTimePipe } from './time-slot-to-time.pipe';

xdescribe('TimeSlotToTimePipe', () => {
  it('create an instance', () => {
    const pipe = new TimeSlotToTimePipe();
    expect(pipe).toBeTruthy();
  });
});
