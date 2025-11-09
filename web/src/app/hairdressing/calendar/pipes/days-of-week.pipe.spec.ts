import { DaysOfWeekPipe } from './days-of-week.pipe';

xdescribe('DaysOfWeekPipe', () => {
  it('create an instance', () => {
    const pipe = new DaysOfWeekPipe();
    expect(pipe).toBeTruthy();
  });
});
