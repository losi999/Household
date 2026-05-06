import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerAddToBlacklistDialog } from './customer-add-to-blacklist-dialog';

describe('CustomerAddToBlacklistDialog', () => {
  let component: CustomerAddToBlacklistDialog;
  let fixture: ComponentFixture<CustomerAddToBlacklistDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerAddToBlacklistDialog],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerAddToBlacklistDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // describe('dialog title', () => {
  //   it('should be rendered', () => {
  //     expect(selector.getComponent(MatDialogTitle)).toBeTruthy();
  //   });
  // });

  // describe('customer autocomplete input', () => {
  //   it('should be rendered', () => {
  //     const autocomplete = selector.getComponent(CustomerAutocompleteInputComponent);

  //     expect(autocomplete.componentInstance.exclude).toEqual(dialogData.excludedCustomerIds);
  //   });

  //   it('should be empty', () => {
  //     const autocomplete = selector.getComponent(CustomerAutocompleteInputComponent);
      
  //     expect(autocomplete.componentInstance.selected.value).toEqual(null);
  //   });

  //   it('should display error if submitted with nothing selected', () => {
  //     const button = selector.getElementByTestId<HTMLButtonElement>('submit-button');
      
  //     button.nativeElement.click();
      
  //     fixture.detectChanges();
      
  //     const error = selector.getComponent(MatError, CustomerAutocompleteInputComponent);
  //     expect(error.nativeElement.textContent).toEqual('Kötelező');
  //   });
  // });

  // describe('save button', () => {
  //   it('should be rendered', () => {
  //     const button = selector.getElementByTestId('submit-button');
  //     expect(button).toBeTruthy();
  //   });

  //   it('should close dialog with form values', () => {
  //     const selectedCustomer = testDataFactory.customer.response();

  //     selector.getComponent(CustomerAutocompleteInputComponent).componentInstance.changed(selectedCustomer);

  //     fixture.detectChanges();
      
  //     const button = selector.getElementByTestId<HTMLButtonElement>('submit-button');
  //     button.nativeElement.click();

  //     expect(mockMatDialogRef.close).toHaveBeenCalledWith([
  //       dialogData.customer,
  //       selectedCustomer,
  //     ]);
  //   });
  // });

  // describe('cancel button', () => {
  //   it('should be rendered', () => {
  //     const button = selector.getComponent(MatDialogClose);
  //     expect(button).toBeTruthy();
  //   });
  // });
});
