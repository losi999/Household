import { PaginatePipe } from './paginate.pipe';

xdescribe('PaginatePipe', () => {
  it('create an instance', () => {
    const pipe = new PaginatePipe();
    expect(pipe).toBeTruthy();
  });
});
