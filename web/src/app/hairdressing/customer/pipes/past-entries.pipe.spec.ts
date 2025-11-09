import { PastEntriesPipe } from './past-entries.pipe';

xdescribe('PastEntriesPipe', () => {
  it('create an instance', () => {
    const pipe = new PastEntriesPipe();
    expect(pipe).toBeTruthy();
  });
});
