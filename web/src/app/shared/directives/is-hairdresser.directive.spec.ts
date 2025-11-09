import { IsHairdresserDirective } from './is-hairdresser.directive';

xdescribe('IsHairdresserDirective', () => {
  it('should create an instance', () => {
    const directive = new IsHairdresserDirective(undefined, undefined, undefined);
    expect(directive).toBeTruthy();
  });
});
