import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearableInput } from './clearable-input';
import { IElementSelector, elementSelectorFactory } from '@household/shared-ui';
import { MatError, MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

describe('ClearableInput', () => {
  let fixture: ComponentFixture<ClearableInput>;
  let selector: IElementSelector;
  const label = 'input label';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClearableInput],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ClearableInput);

    fixture.componentRef.setInput('label', label);
        
    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  });

  describe('label', () => {
    const getElement = () => {
      return selector.getComponent(MatLabel, MatFormField);
    };

    it('should be rendered by default', async () => {
      expect(getElement().nativeElement.textContent).toBe(label);
    });
  });

  describe('prefix', () => { 
    const getElement = () => {
      return selector.getComponent(MatPrefix, MatFormField);
    };
    
    it('should be hidden by default', async () => {
      expect(getElement()).toBeFalsy();
    });

    it('should be set from parameter', async () => {
      const prefix = 'prefix';
      fixture.componentRef.setInput('prefix', prefix);

      await fixture.whenStable();

      expect(getElement().nativeElement.textContent.trim()).toBe(prefix);
    });
  });

  describe('input', () => {
    const getElement = () => {
      return selector.getComponent<MatInput, HTMLInputElement>(MatInput, MatFormField);
    };

    it('should be text by default', async () => {
      const inputElement = getElement();
      expect(inputElement.nativeElement.required).toBe(false);
      expect(inputElement.nativeElement.type).toBe('text');
      expect(inputElement.nativeElement.value).toBe('');
    });

    it('should be number set from parameters', async () => {
      fixture.componentRef.setInput('type', 'number');

      await fixture.whenStable();

      const inputElement = getElement();
      expect(inputElement.nativeElement.required).toBe(false);
      expect(inputElement.nativeElement.type).toBe('number');
      expect(inputElement.nativeElement.value).toBe('');
    });

    it('should be area set from parameters', async () => {
      fixture.componentRef.setInput('type', 'area');

      await fixture.whenStable();

      const inputElement = getElement();
      expect(inputElement.nativeElement.required).toBe(false);
      expect(inputElement.nativeElement.type).toBe('textarea');
      expect(inputElement.nativeElement.value).toBe('');
    });
  });

  describe('clear button', () => {
    const getElement = () => {
      return selector.getComponent<MatSuffix, HTMLButtonElement>(MatSuffix, MatFormField);
    };

    const getIcon = () => {
      return selector.getComponent(MatIcon, MatFormField, MatSuffix);
    };
    
    it('should be rendered by default', async () => {
      expect(getElement().attributes['matIconButton']).toBeDefined();
      expect(getIcon().nativeElement.textContent).toBe('close');
    });

    describe('on click', () => {
      it('should clear value', async () => {
        const value = 10;
        fixture.componentRef.setInput('value', value);

        getElement().nativeElement.click();

        await fixture.whenStable();

        expect(fixture.componentInstance.value()).toBe('');
      });
    });
  });

  describe('errors', () => {
    const getElement = () => {
      return selector.getComponent(MatError, MatFormField);
    };

    it('should be hidden by default', async () => {
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
});
