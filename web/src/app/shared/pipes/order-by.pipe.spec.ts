import { OrderByPipe } from './order-by.pipe';

xdescribe('OrderByPipe', () => {
  it('create an instance', () => {
    const pipe = new OrderByPipe();
    expect(pipe).toBeTruthy();
  });
});
