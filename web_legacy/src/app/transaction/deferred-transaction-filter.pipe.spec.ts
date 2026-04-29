import { DeferredTransactionFilterPipe } from './deferred-transaction-filter.pipe';

xdescribe('DeferredTransactionFilterPipe', () => {
  it('create an instance', () => {
    const pipe = new DeferredTransactionFilterPipe();
    expect(pipe).toBeTruthy();
  });
});
