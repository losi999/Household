import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';

import { ClearableInput } from './clearable-input';
import { IElementSelector, elementSelectorFactory } from '@household/shared-ui';
import { MatError, MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

@Component({
  imports: [
    ClearableInput,
    FormField,
  ],
  template: '<shared-clearable-input label="Név" [type]="type()" [formField]="nameForm.name" />',
})
class TestHost {
  type = signal<'text' | 'number' | 'area'>('text');

  nameModel = signal({
    name: '',
  });

  nameForm = form(this.nameModel, (schemaPath) => {
    required(schemaPath.name, {
      message: 'Kötelező',
    });
  });
}

describe('ClearableInput', () => {
  let fixture: ComponentFixture<ClearableInput>;
  let selector: IElementSelector;

  const label = 'input label';

  const render = async (params?: {
    type?: ReturnType<ClearableInput['type']>;
    prefix?: string;
    value?: string | number;
    errors?: ReturnType<ClearableInput['errors']>;
    touched?: boolean;
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [ClearableInput],
    })
      .compileComponents();

    fixture = TestBed.createComponent(ClearableInput);

    fixture.componentRef.setInput('label', label);
    fixture.componentRef.setInput('type', params?.type ?? 'text');
    fixture.componentRef.setInput('prefix', params?.prefix ?? '');
    fixture.componentRef.setInput('value', params?.value ?? '');
    fixture.componentRef.setInput('errors', params?.errors ?? []);
    fixture.componentRef.setInput('touched', params?.touched ?? false);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('label', () => {
    const getElement = () => {
      return selector.getComponent(MatLabel, MatFormField);
    };

    it('should be rendered by default', async () => {
      await render();

      expect(getElement().nativeElement.textContent).toBe(label);
    });
  });

  describe('prefix', () => { 
    const getElement = () => {
      return selector.getComponent(MatPrefix, MatFormField);
    };
    
    it('should be hidden by default', async () => {
      await render();

      expect(getElement()).toBeFalsy();
    });

    it('should be set from parameter', async () => {
      const prefix = 'prefix';
      await render({
        prefix, 
      });

      expect(getElement().nativeElement.textContent.trim()).toBe(prefix);
    });
  });

  describe('input', () => {
    const getElement = () => {
      return selector.getComponent<MatInput, HTMLInputElement>(MatInput, MatFormField);
    };

    it('should be text by default', async () => {
      await render();

      const inputElement = getElement();
      expect(inputElement.nativeElement.required).toBe(false);
      expect(inputElement.nativeElement.type).toBe('text');
      expect(inputElement.nativeElement.value).toBe('');
    });

    it('should be number set from parameters', async () => {
      await render({
        type: 'number', 
      });

      const inputElement = getElement();
      expect(inputElement.nativeElement.required).toBe(false);
      expect(inputElement.nativeElement.type).toBe('number');
      expect(inputElement.nativeElement.value).toBe('');
    });

    it('should be area set from parameters', async () => {
      await render({
        type: 'area', 
      });

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
      await render();

      expect(getElement().attributes['matIconButton']).toBeDefined();
      expect(getIcon().nativeElement.textContent).toBe('close');
    });

    describe('on click', () => {
      it('should clear value', async () => {
        const value = 10;
        await render({
          value, 
        });

        getElement().nativeElement.click();

        await fixture.whenStable();

        expect(fixture.componentInstance.value()).toBeNull();
        expect(selector.getComponent<MatInput, HTMLInputElement>(MatInput, MatFormField).nativeElement.value).toBe('');
      });
    });
  });

  describe('errors', () => {
    const getElement = () => {
      return selector.getComponent(MatError, MatFormField);
    };

    it('should be hidden by default', async () => {
      await render();

      expect(getElement()).toBeFalsy();
    });

    it('should be set from parameter', async () => {
      const errorMessage = 'error';
      await render({
        errors: [
          {
            kind: 'custom',
            message: errorMessage,
          },
        ],
        touched: true,
      });
      
      expect(getElement().nativeElement.textContent.trim()).toBe(errorMessage); 
    });
  });

  describe('used as a form field', () => {
    let hostFixture: ComponentFixture<TestHost>;

    const renderInForm = async () => {
      TestBed.resetTestingModule();

      await TestBed.configureTestingModule({
        imports: [TestHost],
      })
        .compileComponents();

      hostFixture = TestBed.createComponent(TestHost);
      selector = elementSelectorFactory(hostFixture.debugElement);

      await hostFixture.whenStable();
    };

    const getErrors = () => selector.listComponents(MatError, MatFormField);

    it('should not show the errors of the field until it is touched', async () => {
      await renderInForm();

      expect(getErrors().length).toBe(0);
    });

    it('should show the errors of the field after it is marked as touched', async () => {
      await renderInForm();

      hostFixture.componentInstance.nameForm.name().markAsTouched();
      await hostFixture.whenStable();

      const errorElements = getErrors();

      expect(errorElements.length).toBe(1);
      expect(errorElements[0].nativeElement.textContent.trim()).toBe('Kötelező');
    });

    it('should show the errors of the field after it is marked as touched if the input type is changed', async () => {
      await renderInForm();
      hostFixture.componentInstance.type.set('area');
      await hostFixture.whenStable();

      hostFixture.componentInstance.nameForm.name().markAsTouched();
      await hostFixture.whenStable();

      expect(getErrors().length).toBe(1);
    });

    it('should hide the errors once the field is valid', async () => {
      await renderInForm();
      hostFixture.componentInstance.nameForm.name().markAsTouched();
      await hostFixture.whenStable();

      hostFixture.componentInstance.nameModel.set({
        name: 'valami',
      });
      await hostFixture.whenStable();

      expect(getErrors().length).toBe(0);
    });
  });
});
