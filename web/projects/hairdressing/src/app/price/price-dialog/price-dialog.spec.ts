import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceDialog, PriceDialogData } from './price-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { AmountInput, ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatButton } from '@angular/material/button';
import { MatSelect } from '@angular/material/select';
import { priceUnitsOfMeasurement } from '@household/shared/constants';

describe('PriceDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);
  const AmountInputStub = createStubComponent(AmountInput);

  let fixture: ComponentFixture<PriceDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<PriceDialog>>;

  const price = testDataFactory.price.response({
    name: 'Hajvágás',
    amount: 4500,
    unitOfMeasurement: 'g',
  });

  const getNameInput = () => {
    return selector.getComponent<ClearableInput>(ClearableInputStub, MatDialogContent);
  };

  const getAmountInput = () => {
    return selector.getComponent<AmountInput>(AmountInputStub, MatDialogContent);
  };

  const getUnitSelect = () => {
    return selector.getComponent<MatSelect>(MatSelect, MatDialogContent);
  };

  const getSaveButton = () => {
    return selector.getComponent<MatButton, HTMLButtonElement>(MatButton, MatDialogActions);
  };

  const setName = async (value: string) => {
    getNameInput().componentInstance.value.set(value);

    await fixture.whenStable();
  };

  const setAmount = async (value: number) => {
    getAmountInput().componentInstance.value.set(value);

    await fixture.whenStable();
  };

  const render = async (dialogData?: PriceDialogData) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [PriceDialog],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData,
        },
        {
          provide: MatDialogRef,
          useValue: mockDialogRef.service,
        },
      ],
    })
      .overrideComponent(PriceDialog, {
        remove: {
          imports: [
            ClearableInput,
            AmountInput,
          ],
        },
        add: {
          imports: [
            ClearableInputStub,
            AmountInputStub,
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PriceDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should be the create title if no price is given', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Új ár');
    });

    it('should be the edit title if a price is given', async () => {
      await render(price);

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Ár szerkesztése');
    });
  });

  describe('name input', () => {
    it('should be empty if no price is given', async () => {
      await render();

      expect(getNameInput().componentInstance.label()).toBe('Név');
      expect(getNameInput().componentInstance.value()).toBe('');
    });

    it('should be filled with the name of the price', async () => {
      await render(price);

      expect(getNameInput().componentInstance.value()).toBe(price.name);
    });

    it('should be required', async () => {
      await render();

      expect(getNameInput().componentInstance.errors().map(error => error.message)).toEqual(['Kötelező']);
    });
  });

  describe('amount input', () => {
    it('should be rendered with its settings', async () => {
      await render();

      expect(getAmountInput().componentInstance.label()).toBe('Ár');
      expect(getAmountInput().componentInstance.currency()).toBe('Ft');
      expect(getAmountInput().componentInstance.signHidden()).toBe(true);
    });

    it('should be zero if no price is given', async () => {
      await render();

      expect(getAmountInput().componentInstance.value()).toBe(0);
    });

    it('should be filled with the amount of the price', async () => {
      await render(price);

      expect(getAmountInput().componentInstance.value()).toBe(price.amount);
    });

    it('should accept a positive number only', async () => {
      await render();

      await setAmount(0);
      expect(getAmountInput().componentInstance.errors().map(error => error.message)).toContain('Az összegnek nagyobbnak kell lennie, mint 0');

      await setAmount(-5);
      expect(getAmountInput().componentInstance.errors().map(error => error.message)).toEqual(['Az összegnek nagyobbnak kell lennie, mint 0']);

      await setAmount(100);
      expect(getAmountInput().componentInstance.errors()).toEqual([]);
    });
  });

  describe('unit of measurement select', () => {
    it('should have the default value if no price is given', async () => {
      await render();

      expect(getUnitSelect().componentInstance.value).toBe('db');
    });

    it('should be set to the unit of the price', async () => {
      await render(price);

      expect(getUnitSelect().componentInstance.value).toBe(price.unitOfMeasurement);
    });

    it('should offer the accepted units of measurement', async () => {
      await render();

      getUnitSelect().componentInstance.open();
      await fixture.whenStable();

      const options = Array.from(document.querySelectorAll('mat-option')).map(option => option.textContent.trim());

      expect(options).toEqual([...priceUnitsOfMeasurement]);
    });
  });

  describe('save button', () => {
    it('should be rendered', async () => {
      await render();

      expect(getSaveButton().nativeElement.textContent).toBe('Mentés');
    });

    it('should not close the dialog if the form is invalid', async () => {
      await render();

      getSaveButton().nativeElement.click();
      await fixture.whenStable();

      validateFunctionCall(mockDialogRef.functions.close);
    });

    it('should not close the dialog if the amount is not positive', async () => {
      await render();
      await setName('Festés');

      getSaveButton().nativeElement.click();
      await fixture.whenStable();

      validateFunctionCall(mockDialogRef.functions.close);
    });

    it('should close the dialog with the values of the form', async () => {
      await render();
      await setName('Festés');
      await setAmount(12000);
      fixture.componentInstance.priceForm.unitOfMeasurement().value.set('óra');
      await fixture.whenStable();

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: 'Festés',
        amount: 12000,
        unitOfMeasurement: 'óra',
      });
    });

    it('should close the dialog with the values of the unchanged price when updating', async () => {
      await render(price);

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: price.name,
        amount: price.amount,
        unitOfMeasurement: price.unitOfMeasurement,
      });
    });
  });

  describe('cancel button', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getElementByCss('[mat-dialog-close]', MatDialogActions).nativeElement.textContent).toBe('Mégse');
    });
  });
});
