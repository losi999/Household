import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconText } from './icon-text';
import { elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { MatIcon } from '@angular/material/icon';

describe('IconText', () => {
  let fixture: ComponentFixture<IconText>;
  let selector: IElementSelector;

  const render = async (params?: {
    icon?: string;
    text?: string;
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [IconText],
    })
      .compileComponents();

    fixture = TestBed.createComponent(IconText);
    fixture.componentRef.setInput('icon', params?.icon ?? 'icon');
    fixture.componentRef.setInput('text', params?.text ?? 'text');

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  it('should render', async () => {
    const icon = 'custom icon';
    const text = 'custom text';
    await render({
      icon,
      text, 
    });

    expect(selector.getComponent(MatIcon, '.row').nativeElement.textContent.trim()).toBe(icon);
    expect(selector.getElementByCss('.row .text').nativeElement.textContent.trim()).toBe(text);
  });
});
