import { UpcomingEntriesPipe } from './upcoming-entries.pipe';

xdescribe('UpcomingEntriesPipe', () => {
  it('create an instance', () => {
    const pipe = new UpcomingEntriesPipe();
    expect(pipe).toBeTruthy();
  });
});
