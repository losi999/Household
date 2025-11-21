import { IsHairdresserDirective } from './is-hairdresser.directive';

describe.skip('IsHairdresserDirective', () => {
  it('should create an instance', () => {
    const directive = new IsHairdresserDirective(undefined, undefined, undefined);
    expect(directive).toBeTruthy();
  });
});
