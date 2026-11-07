import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DurationStepper } from './duration-stepper';
import { elementSelectorFactory, HoldableButton, IElementSelector } from '@household/shared-ui';
import { DAY_LENGTH } from '@household/shared/constants';

describe('DurationStepper', () => {
  let fixture: ComponentFixture<DurationStepper>;
  let selector: IElementSelector;

  const getButtons = () => selector.listComponents<HoldableButton, HTMLButtonElement>(HoldableButton);
  const getDecreaseButton = () => getButtons()[0];
  const getIncreaseButton = () => getButtons()[1];
  const getDuration = () => selector.getElementByCss('.duration > span').nativeElement.textContent;

  const press = async (button: ReturnType<typeof getDecreaseButton>) => {
    button.nativeElement.dispatchEvent(new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
    }));
    button.nativeElement.dispatchEvent(new MouseEvent('pointerup', {
      bubbles: true,
      cancelable: true,
    }));

    await fixture.whenStable();
  };

  const render = async (value: number = 1) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [DurationStepper],
    })
      .compileComponents();

    fixture = TestBed.createComponent(DurationStepper);
    fixture.componentRef.setInput('value', value);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('duration', () => {
    it('should be shown in hours', async () => {
      await render(5);

      expect(getDuration()).toBe('1:15 óra');
    });
  });

  describe('decrease button', () => {
    it('should be disabled at the minimum', async () => {
      await render(1);

      expect(getDecreaseButton().nativeElement.disabled).toBe(true);
    });

    it('should decrease the value by one slot', async () => {
      await render(5);

      await press(getDecreaseButton());

      expect(fixture.componentInstance.value()).toBe(4);
      expect(getDuration()).toBe('1:00 óra');
    });
  });

  describe('increase button', () => {
    it('should increase the value by one slot', async () => {
      await render(5);

      await press(getIncreaseButton());

      expect(fixture.componentInstance.value()).toBe(6);
    });

    it('should not increase the value over the length of a day', async () => {
      await render(DAY_LENGTH);

      await press(getIncreaseButton());

      expect(fixture.componentInstance.value()).toBe(DAY_LENGTH);
    });
  });
});
