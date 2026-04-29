import { IsEditorDirective } from './is-editor.directive';

xdescribe('IsEditorDirective', () => {
  it('should create an instance', () => {
    const directive = new IsEditorDirective(undefined, undefined, undefined);
    expect(directive).toBeTruthy();
  });
});
