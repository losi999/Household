import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerDialog, CustomerDialogData } from './customer-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatMiniFabButton } from '@angular/material/button';

describe('CustomerDialog', () => {
  const ClearableInputStub = createStubComponent(ClearableInput);

  let fixture: ComponentFixture<CustomerDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<CustomerDialog>>;

  const customer = testDataFactory.customer.response({
    name: 'Kiss Anna',
    description: 'Megjegyzés a vendégről',
    isGroup: true,
    rating: 5,
  });

  const getNameInput = () => {
    return selector.listComponents<ClearableInput>(ClearableInputStub)[0];
  };

  const getDescriptionInput = () => {
    return selector.listComponents<ClearableInput>(ClearableInputStub)[1];
  };

  const getGroupCheckbox = () => {
    return selector.getComponent<MatCheckbox>(MatCheckbox);
  };

  const getRatingButtons = () => {
    return selector.listComponents<MatMiniFabButton, HTMLButtonElement>(MatMiniFabButton);
  };

  const getSelectedRatings = () => {
    return getRatingButtons()
      .map((b, i) => b.nativeElement.classList.contains('selected') ? i + 1 : undefined)
      .filter(r => r);
  };

  const getSaveButton = () => {
    return selector.getComponent<MatButton, HTMLButtonElement>(MatButton, MatDialogActions);
  };

  const setValue = async (input: ClearableInput, value: string) => {
    input.value.set(value);

    await fixture.whenStable();
  };

  const render = async (dialogData?: CustomerDialogData) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [CustomerDialog],
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
      .overrideComponent(CustomerDialog, {
        remove: {
          imports: [ClearableInput],
        },
        add: {
          imports: [ClearableInputStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should be the create title if no customer is given', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Új');
    });

    it('should be the edit title if a customer is given', async () => {
      await render(customer);

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Szerkesztés');
    });
  });

  describe('name input', () => {
    it('should be empty and required if no customer is given', async () => {
      await render();

      expect(getNameInput().componentInstance.label()).toBe('Név');
      expect(getNameInput().componentInstance.value()).toBe('');
      expect(getNameInput().componentInstance.errors().map(error => error.message)).toEqual(['Kötelező']);
    });

    it('should be filled with the name of the customer', async () => {
      await render(customer);

      expect(getNameInput().componentInstance.value()).toBe(customer.name);
      expect(getNameInput().componentInstance.errors()).toEqual([]);
    });
  });

  describe('group checkbox', () => {
    it('should be unchecked if no customer is given', async () => {
      await render();

      expect(getGroupCheckbox().componentInstance.checked).toBe(false);
      expect(getGroupCheckbox().nativeElement.textContent).toContain('Több személy tartozik ide?');
    });

    it('should be checked if the customer is a group', async () => {
      await render(customer);

      expect(getGroupCheckbox().componentInstance.checked).toBe(true);
    });

    it('should be toggled by a click', async () => {
      await render();

      getGroupCheckbox().nativeElement.querySelector('input').click();

      await fixture.whenStable();

      expect(getGroupCheckbox().componentInstance.checked).toBe(true);
      expect(fixture.componentInstance.customerForm.isGroup().value()).toBe(true);
    });
  });

  describe('description input', () => {
    it('should be an empty text area if no customer is given', async () => {
      await render();

      expect(getDescriptionInput().componentInstance.label()).toBe('Megjegyzés');
      expect(getDescriptionInput().componentInstance.type()).toBe('area');
      expect(getDescriptionInput().componentInstance.value()).toBe('');
    });

    it('should be filled with the description of the customer', async () => {
      await render(customer);

      expect(getDescriptionInput().componentInstance.value()).toBe(customer.description);
    });
  });

  describe('rating', () => {
    it('should have five buttons', async () => {
      await render();

      expect(getRatingButtons().map(b => b.nativeElement.textContent.trim())).toEqual([
        'sentiment_stressed',
        'sentiment_dissatisfied',
        'sentiment_neutral',
        'sentiment_satisfied',
        'sentiment_excited',
      ]);
    });

    it('should select the neutral one if no customer is given', async () => {
      await render();

      expect(getSelectedRatings()).toEqual([3]);
    });

    it('should select the rating of the customer', async () => {
      await render(customer);

      expect(getSelectedRatings()).toEqual([5]);
    });

    [
      1,
      2,
      3,
      4,
      5,
    ].forEach((rating) => {
      it(`should select the button #${rating} if it is clicked`, async () => {
        await render();

        getRatingButtons()[rating - 1].nativeElement.click();

        await fixture.whenStable();

        expect(getSelectedRatings()).toEqual([rating]);
        expect(fixture.componentInstance.customerForm.rating().value()).toBe(rating);
      });
    });
  });

  describe('save button', () => {
    it('should be rendered', async () => {
      await render();

      expect(getSaveButton().nativeElement.textContent).toBe('Mentés');
    });

    it('should not close the dialog if the name is empty', async () => {
      await render();

      getSaveButton().nativeElement.click();

      await fixture.whenStable();

      validateFunctionCall(mockDialogRef.functions.close);
      expect(getNameInput().componentInstance.touched()).toBe(true);
    });

    it('should close the dialog with the entered values', async () => {
      await render();

      await setValue(getNameInput().componentInstance, 'Nagy Béla');
      await setValue(getDescriptionInput().componentInstance, '  Törzsvendég  ');
      getGroupCheckbox().nativeElement.querySelector('input').click();
      getRatingButtons()[3].nativeElement.click();

      await fixture.whenStable();

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: 'Nagy Béla',
        description: 'Törzsvendég',
        isGroup: true,
        rating: 4,
      });
    });

    it('should close the dialog with an undefined description if it is blank', async () => {
      await render();

      await setValue(getNameInput().componentInstance, 'Nagy Béla');
      await setValue(getDescriptionInput().componentInstance, '   ');

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: 'Nagy Béla',
        description: undefined,
        isGroup: false,
        rating: 3,
      });
    });

    it('should close the dialog with the values of the edited customer', async () => {
      await render(customer);

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, {
        name: customer.name,
        description: customer.description,
        isGroup: customer.isGroup,
        rating: customer.rating,
      });
    });
  });

  describe('cancel button', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatDialogClose, MatDialogActions).nativeElement.textContent).toBe('Mégse');
    });
  });
});
