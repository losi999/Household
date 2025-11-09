import { RemovePendingEntryPipe } from './remove-pending-entry.pipe';

xdescribe('RemovePendingEntryPipe', () => {
  it('create an instance', () => {
    const pipe = new RemovePendingEntryPipe();
    expect(pipe).toBeTruthy();
  });
});
