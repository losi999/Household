import { MinutesToHourPipe } from './minutes-to-hour.pipe';

xdescribe('MinutesToHourPipe', () => {
  it('create an instance', () => {
    const pipe = new MinutesToHourPipe();
    expect(pipe).toBeTruthy();
  });
});
