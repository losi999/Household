import { DeferredTransactionFilterPipe } from './deferred-transaction-filter.pipe';

describe.skip('DeferredTransactionFilterPipe', () => {
  it('create an instance', () => {
    const pipe = new DeferredTransactionFilterPipe();
    expect(pipe).toBeTruthy();
  });
});
