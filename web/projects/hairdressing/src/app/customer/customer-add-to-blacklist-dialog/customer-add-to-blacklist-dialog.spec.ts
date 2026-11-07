import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerAddToBlacklistDialog, CustomerAddToBlacklistDialogData } from './customer-add-to-blacklist-dialog';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { CustomerAutocompleteInput } from '@hairdressing/app/customer/customer-autocomplete-input/customer-autocomplete-input';
import { createStubComponent, elementSelectorFactory, IElementSelector } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateFunctionCall } from '@household/shared/common/unit-testing';

describe('CustomerAddToBlacklistDialog', () => {
  const CustomerAutocompleteInputStub = createStubComponent(CustomerAutocompleteInput);

  let fixture: ComponentFixture<CustomerAddToBlacklistDialog>;
  let selector: IElementSelector;
  let mockDialogRef: MockService<MatDialogRef<CustomerAddToBlacklistDialog>>;

  const blacklisted1 = testDataFactory.customer.response();
  const blacklisted2 = testDataFactory.customer.response();
  const customer = testDataFactory.customer.response({
    blacklistedCustomers: [
      blacklisted1,
      blacklisted2,
    ],
  });

  const getAutocomplete = () => {
    return selector.getComponent<CustomerAutocompleteInput>(CustomerAutocompleteInputStub, MatDialogContent);
  };

  const getSaveButton = () => {
    return selector.getElementByTestId<HTMLButtonElement>('submit-button', MatDialogActions);
  };

  const render = async (dialogData: CustomerAddToBlacklistDialogData = customer) => {
    TestBed.resetTestingModule();

    mockDialogRef = createMockService('close');

    await TestBed.configureTestingModule({
      imports: [CustomerAddToBlacklistDialog],
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
      .overrideComponent(CustomerAddToBlacklistDialog, {
        remove: {
          imports: [CustomerAutocompleteInput],
        },
        add: {
          imports: [CustomerAutocompleteInputStub],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerAddToBlacklistDialog);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('dialog title', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatDialogTitle).nativeElement.textContent).toBe('Hozzáadás tiltólistához');
    });
  });

  describe('customer autocomplete input', () => {
    it('should be rendered with the label', async () => {
      await render();

      expect(getAutocomplete().componentInstance.label()).toBe('Vendég');
    });

    it('should exclude the customer and the already blacklisted customers', async () => {
      await render();

      expect(getAutocomplete().componentInstance.exclude()).toEqual([
        customer.customerId,
        blacklisted1.customerId,
        blacklisted2.customerId,
      ]);
    });

    it('should exclude only the customer if the blacklist is empty', async () => {
      const customerWithoutBlacklist = testDataFactory.customer.response();

      await render(customerWithoutBlacklist);

      expect(getAutocomplete().componentInstance.exclude()).toEqual([customerWithoutBlacklist.customerId]);
    });

    it('should be empty and required', async () => {
      await render();

      expect(getAutocomplete().componentInstance.value()).toBeNull();
      expect(getAutocomplete().componentInstance.errors().map(error => error.message)).toEqual(['Kötelező']);
    });
  });

  describe('save button', () => {
    it('should be rendered', async () => {
      await render();

      expect(getSaveButton().nativeElement.textContent).toBe('Mentés');
    });

    it('should not close the dialog if no customer is selected', async () => {
      await render();

      getSaveButton().nativeElement.click();

      await fixture.whenStable();

      validateFunctionCall(mockDialogRef.functions.close);
    });

    it('should close the dialog with the customer and the selected one', async () => {
      const selectedCustomer = testDataFactory.customer.response();

      await render();

      getAutocomplete().componentInstance.value.set(selectedCustomer);

      await fixture.whenStable();

      getSaveButton().nativeElement.click();

      validateFunctionCall(mockDialogRef.functions.close, [
        customer,
        selectedCustomer,
      ]);
    });
  });

  describe('cancel button', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatDialogClose, MatDialogActions).nativeElement.textContent).toBe('Mégse');
    });
  });
});
