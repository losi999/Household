import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HoldableButton } from './holdable-button';
import { Component } from '@angular/core';
import { elementSelectorFactory, IElementSelector } from '@household/shared-ui';

@Component({
  template: `
    <button sharedHoldableButton>button</button>
  `,
  imports: [HoldableButton],
})
class TestHostComponent {}

describe('HoldableButton', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let selector: IElementSelector;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should prevent context menu from appearing', () => {
    const button = selector.getComponent<HoldableButton, HTMLButtonElement>(HoldableButton);

    const prevented = !button.nativeElement.dispatchEvent(new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
    }));
    expect(prevented).toBe(true);
  });

  it('should emit after pressing down', () => {
    const button = selector.getComponent<HoldableButton, HTMLButtonElement>(HoldableButton);

    const directive = button.injector.get(HoldableButton);

    const emitSpy = vi.spyOn(directive.hold, 'emit');

    button.nativeElement.dispatchEvent(new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
    }));

    expect(emitSpy).toHaveBeenCalledTimes(1);    
  });

  it('should emit twice after holding for 550ms', () => {
    const button = selector.getComponent<HoldableButton, HTMLButtonElement>(HoldableButton);

    const directive = button.injector.get(HoldableButton);

    const emitSpy = vi.spyOn(directive.hold, 'emit');

    button.nativeElement.dispatchEvent(new MouseEvent('pointerdown', {
      bubbles: true,
      cancelable: true,
    }));

    expect(emitSpy).toHaveBeenCalledTimes(1); 
    vi.advanceTimersByTime(550);
  
    expect(emitSpy).toHaveBeenCalledTimes(2);
  });  
});
