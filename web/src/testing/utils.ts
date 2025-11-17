import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { IElementSelector } from '@household/web/testing/element-selector';

export const setValueOfClearableInput = (selector: IElementSelector, value: string, testId?: string) => {
  const component = testId ? selector.getComponentByTestId<ClearableInputComponent>(testId) : selector.getComponent(ClearableInputComponent);

  component.componentInstance.input.setValue(value);
  
  // const inpoutTag = component.componentInstance.type === 'area' ? 'textarea' : 'input';

  // const input = selector.getElementByCss<HTMLInputElement>(inpoutTag, component).nativeElement;

  // input.value = value;
  // input.dispatchEvent(new Event('input'));
};
