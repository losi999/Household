import { OrderByPipe } from './order-by.pipe';

describe.skip('OrderByPipe', () => {
  it('create an instance', () => {
    const pipe = new OrderByPipe();
    expect(pipe).toBeTruthy();
  });
});
