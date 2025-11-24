import { OpenAccountFilterPipe } from './open-account.pipe';

xdescribe('OpenAccountPipe', () => {
  it('create an instance', () => {
    const pipe = new OpenAccountFilterPipe();
    expect(pipe).toBeTruthy();
  });
});
