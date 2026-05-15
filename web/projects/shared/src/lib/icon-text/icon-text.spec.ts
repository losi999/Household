import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconText } from './icon-text';
import { elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { MatIcon } from '@angular/material/icon';

describe('IconText', () => {
  let fixture: ComponentFixture<IconText>;
  let selector: IElementSelector;
  const icon = 'icon';
  const text = 'text';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconText],
    })
      .compileComponents();

    fixture = TestBed.createComponent(IconText);

    fixture.componentRef.setInput('icon', icon);
    fixture.componentRef.setInput('text', text);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  });

  it('should render', () => {
    expect(selector.getComponent(MatIcon, '.row').nativeElement.textContent.trim()).toBe(icon);
    expect(selector.getElementByCss('.row .text').nativeElement.textContent.trim()).toBe(text);
  });
});
