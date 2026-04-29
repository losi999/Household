import { DaysOfMonthPipe } from './days-of-month.pipe';

xdescribe('DaysOfMonthPipe', () => {
  it('create an instance', () => {
    const pipe = new DaysOfMonthPipe();
    expect(pipe).toBeTruthy();
  });
});
