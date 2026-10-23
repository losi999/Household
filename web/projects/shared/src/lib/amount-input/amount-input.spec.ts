import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountInput } from './amount-input';
import { elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { MatError, MatFormField, MatHint, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';

describe('AmountInput', () => {
  let fixture: ComponentFixture<AmountInput>;
  let selector: IElementSelector;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmountInput],
    })
      .compileComponents();

    fixture = TestBed.createComponent(AmountInput);
    
    selector = elementSelectorFactory(fixture.debugElement);
    
    await fixture.whenStable();
  });

  describe('inverse value button', () => {  
    const getElement = () => {
      return selector.getComponent<MatPrefix, HTMLButtonElement>(MatPrefix, MatFormField);
    };
    const getIcon = () => {
      return selector.getComponent<MatIcon>(MatIcon, MatFormField, MatPrefix);
    };

    it('should be rendered by default', async () => {
      const numericSignElement = getElement();
      expect(numericSignElement.attributes['matIconButton']).toBeDefined();
      expect(numericSignElement.nativeElement.disabled).toBe(false);
      expect(getIcon().nativeElement.textContent).toBe('add');
    });

    it('should be hidden', async () => {
      fixture.componentRef.setInput('signHidden', true);

      await fixture.whenStable();

      expect(getElement()).toBeFalsy(); 
      expect(getIcon()).toBeFalsy();
    });

    it('should be disabled', async () => {
      fixture.componentRef.setInput('signDisabled', true);

      await fixture.whenStable();

      const numericSignElement = getElement();
      expect(numericSignElement.attributes['matIconButton']).toBeDefined();
      expect(numericSignElement.nativeElement.disabled).toBe(true);
      expect(getIcon().nativeElement.textContent).toBe('add');
    });

    it('should be negative', async () => {
      fixture.componentRef.setInput('isPositive', false);

      await fixture.whenStable();

      const numericSignElement = getElement();
      expect(numericSignElement.attributes['matIconButton']).toBeDefined();
      expect(numericSignElement.nativeElement.disabled).toBe(false);
      expect(getIcon().nativeElement.textContent).toBe('remove');
    });

    describe('on click', () => {
      it('should inverse sign', async () => {
        const numericSignElement = getElement();
        numericSignElement.nativeElement.click();

        await fixture.whenStable();

        expect(numericSignElement.attributes['matIconButton']).toBeDefined();
        expect(numericSignElement.nativeElement.disabled).toBe(false);
        expect(getIcon().nativeElement.textContent).toBe('remove');
      });
      
      it('should inverse value', async () => {
        const value = 10;
        fixture.componentRef.setInput('value', value);

        const numericSignElement = getElement();
        numericSignElement.nativeElement.click();

        await fixture.whenStable();

        expect(fixture.componentInstance.value()).toBe(value * -1);
      });
    });
  });

  describe('label', () => {
    const getElement = () => {
      return selector.getComponent(MatLabel, MatFormField);
    };

    it('should be set by default', async () => {
      expect(getElement().nativeElement.textContent).toBe('Összeg');
    });

    it('should be set from parameter', async () => {
      const label = 'custom label';
      fixture.componentRef.setInput('label', label);

      await fixture.whenStable();
      
      expect(getElement().nativeElement.textContent).toBe(label);
    });
  });

  describe('input element', () => {
    const getElement = () => {
      return selector.getComponent<MatInput, HTMLInputElement>(MatInput, MatFormField);
    };

    it('should be set by default', async () => {
      const inputElement = getElement();
      expect(inputElement.nativeElement.required).toBe(false);
      expect(inputElement.nativeElement.min).toBe('0');
      expect(inputElement.nativeElement.type).toBe('number');
      expect(inputElement.nativeElement.value).toBe('0');
    });

    it('should be set from parameter', async () => {
      const value = 10;
      fixture.componentRef.setInput('value', value);

      await fixture.whenStable();
      
      const inputElement = getElement();
      expect(inputElement.nativeElement.required).toBe(false);
      expect(inputElement.nativeElement.min).toBe('0');
      expect(inputElement.nativeElement.type).toBe('number');
      expect(inputElement.nativeElement.value).toBe(`${value}`);
    });
  });

  describe('currency', () => {
    const getElement = () => {
      return selector.getComponent(MatSuffix, MatFormField);
    };

    it('should be empty by default', async () => {
      expect(getElement().nativeElement.textContent).toBe('');
    });

    it('should be set from parameter', async () => {
      const currency = 'Ft';
      fixture.componentRef.setInput('currency', currency);

      await fixture.whenStable();
      
      expect(getElement().nativeElement.textContent).toBe(currency);
    });
  });

  describe('new balance', () => {
    const getElement = () => {
      return selector.getComponent(MatHint, MatFormField);
    };

    it('should be empty by default', async () => {
      expect(getElement()).toBeFalsy();
    });

    it('should be set from parameter', async () => {
      const newBalance = 10;
      fixture.componentRef.setInput('newBalance', newBalance);

      await fixture.whenStable();
      
      expect(getElement().nativeElement.textContent).toContain(`Új egyenleg: ${newBalance}`);
    });
  });

  describe('errors', () => {
    const getElement = () => {
      return selector.getComponent(MatError, MatFormField);
    };

    it('should be empty by default', async () => {
      expect(getElement()).toBeFalsy();
    });

    it('should be set from parameter', async () => {
      const errorMessage = 'error';
      fixture.componentRef.setInput('errors', [
        {
          message: errorMessage,
        },
      ]);
      fixture.componentRef.setInput('touched', true);

      await fixture.whenStable();
      
      expect(getElement().nativeElement.textContent.trim()).toBe(errorMessage); 
    });
  });

  describe('sign of the value', () => {
    const getInput = () => {
      return selector.getComponent<MatInput, HTMLInputElement>(MatInput, MatFormField).nativeElement;
    };

    const type = async (text: string) => {
      getInput().value = text;
      getInput().dispatchEvent(new Event('input'));

      await fixture.whenStable();
    };

    it('should be shown as a non-negative number in the input if the value is negative', async () => {
      fixture.componentRef.setInput('isPositive', false);
      fixture.componentRef.setInput('value', -10);

      await fixture.whenStable();

      expect(getInput().value).toBe('10');
      expect(fixture.componentInstance.value()).toBe(-10);
    });

    it('should make the typed number the value as is if the sign is positive', async () => {
      await type('10');

      expect(getInput().value).toBe('10');
      expect(fixture.componentInstance.value()).toBe(10);
    });

    it('should make the typed number negative in the value if the sign is negative', async () => {
      fixture.componentRef.setInput('isPositive', false);

      await fixture.whenStable();
      await type('10');

      expect(getInput().value).toBe('10');
      expect(fixture.componentInstance.value()).toBe(-10);
    });

    it('should not keep a typed negative number in the input and use the sign of the flag for the value', async () => {
      await type('-10');

      expect(getInput().value).toBe('10');
      expect(fixture.componentInstance.value()).toBe(10);
    });

    it('should not keep a typed negative number in the input if the sign is negative', async () => {
      fixture.componentRef.setInput('isPositive', false);

      await fixture.whenStable();
      await type('-10');

      expect(getInput().value).toBe('10');
      expect(fixture.componentInstance.value()).toBe(-10);
    });

    it('should not make zero negative', async () => {
      fixture.componentRef.setInput('isPositive', false);

      await fixture.whenStable();
      await type('0');

      expect(fixture.componentInstance.value()).toBe(0);
    });

    it('should change the sign of the value if the sign is changed from outside', async () => {
      fixture.componentRef.setInput('value', 10);

      await fixture.whenStable();

      fixture.componentRef.setInput('isPositive', false);

      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toBe(-10);
      expect(getInput().value).toBe('10');

      fixture.componentRef.setInput('isPositive', true);

      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toBe(10);
      expect(getInput().value).toBe('10');
    });

    it('should keep the input non-negative when the sign is inversed with the button', async () => {
      await type('10');

      selector.getComponent<MatPrefix, HTMLButtonElement>(MatPrefix, MatFormField).nativeElement.click();
      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toBe(-10);
      expect(getInput().value).toBe('10');
    });
  });
});
