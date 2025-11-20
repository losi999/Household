import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogClose, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatError } from '@angular/material/form-field';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { CustomerAddToBlacklistDialogComponent, CustomerAddToBlacklistDialogData, CustomerAddToBlacklistDialogResult } from '@household/web/app/hairdressing/customer/customer-add-to-blacklist-dialog/customer-add-to-blacklist-dialog.component';
import { CustomerAutocompleteInputComponent } from '@household/web/app/shared/autocomplete/customer-autocomplete-input/customer-autocomplete-input.component';
import { elementSelectorFactory, IElementSelector } from '@household/web/testing/element-selector';
import { provideMockStore } from '@ngrx/store/testing';

describe('CustomerAddToBlacklistDialogComponent', () => {
  let fixture: ComponentFixture<CustomerAddToBlacklistDialogComponent>;
  let mockMatDialogRef: jasmine.SpyObj<MatDialogRef<CustomerAddToBlacklistDialogComponent, CustomerAddToBlacklistDialogResult>>;
  let selector: IElementSelector;
  let dialogData: CustomerAddToBlacklistDialogData;

  beforeEach(async () => {
    mockMatDialogRef = jasmine.createSpyObj(['close']);

    dialogData = {
      customer: testDataFactory.customer.response(),
      excludedCustomerIds: [testDataFactory.customer.id()],
    };

    await TestBed.configureTestingModule({
      imports: [CustomerAddToBlacklistDialogComponent],
      providers: [
        provideMockStore({
          initialState: {
            customers: {},
          },
        }),
        {
          provide: MatDialogRef,
          useValue: mockMatDialogRef,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData,
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerAddToBlacklistDialogComponent);
    
    selector = elementSelectorFactory(fixture.debugElement);

    fixture.detectChanges();
  });

  describe('dialog title', () => {
    it('should be rendered', () => {
      expect(selector.getComponent(MatDialogTitle)).toBeTruthy();
    });
  });

  describe('customer autocomplete input', () => {
    it('should be rendered', () => {
      const autocomplete = selector.getComponent(CustomerAutocompleteInputComponent);

      expect(autocomplete.componentInstance.exclude).toEqual(dialogData.excludedCustomerIds);
    });

    it('should be empty', () => {
      const autocomplete = selector.getComponent(CustomerAutocompleteInputComponent);
      
      expect(autocomplete.componentInstance.selected.value).toEqual(null);
    });

    it('should display error if submitted with nothing selected', () => {
      const button = selector.getElementByTestId<HTMLButtonElement>('submit-button');
      
      button.nativeElement.click();
      
      fixture.detectChanges();
      
      const error = selector.getComponent(MatError, CustomerAutocompleteInputComponent);
      expect(error.nativeElement.textContent).toEqual('Kötelező');
    });
  });

  describe('save button', () => {
    it('should be rendered', () => {
      const button = selector.getElementByTestId('submit-button');
      expect(button).toBeTruthy();
    });

    it('should close dialog with form values', () => {
      const selectedCustomer = testDataFactory.customer.response();

      selector.getComponent(CustomerAutocompleteInputComponent).componentInstance.changed(selectedCustomer);

      fixture.detectChanges();
      
      const button = selector.getElementByTestId<HTMLButtonElement>('submit-button');
      button.nativeElement.click();

      expect(mockMatDialogRef.close).toHaveBeenCalledWith([
        dialogData.customer,
        selectedCustomer,
      ]);
    });
  });

  describe('cancel button', () => {
    it('should be rendered', () => {
      const button = selector.getComponent(MatDialogClose);
      expect(button).toBeTruthy();
    });
  });
});
