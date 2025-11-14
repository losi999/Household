import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerHomeComponent } from './customer-home.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { AuthService } from '@household/web/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { ClearableInputComponent } from '@household/web/app/shared/clearable-input/clearable-input.component';
import { createStubComponent } from '@household/web/utils/unit-testing';
import { AutocompleteFilterPipe } from '@household/web/app/shared/autocomplete/autocomplete-filter.pipe';
import { Customer } from '@household/shared/types/types';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { By } from '@angular/platform-browser';
import { customerActions, customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';

describe('CustomerHomeComponent', () => {
  let fixture: ComponentFixture<CustomerHomeComponent>;
  let customers: Customer.Response[];
  let searchedCustomer: Customer.Response;
  let mockStore: MockStore;
  const customerListStubComponent = createStubComponent('household-customer-list', ['customers']);

  beforeEach(async () => {
    searchedCustomer = testDataFactory.customer.response();
    customers = [
      searchedCustomer,
      testDataFactory.customer.response(),
    ];

    await TestBed.configureTestingModule({
      declarations: [CustomerHomeComponent],
      imports: [
        ToolbarComponent,
        MatIconModule,
        ClearableInputComponent,
        customerListStubComponent,
        AutocompleteFilterPipe,
      ],
      providers: [
        provideMockStore({
          initialState: {
            customers: {
              customerList: customers,
            },
            progress: {},
          },
        }),
        {
          provide: AuthService,
          useValue: jasmine.createSpyObj<AuthService>('AuthService', [], ['isLoggedIn']), 
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerHomeComponent);
    mockStore = TestBed.inject(MockStore);

    spyOn(mockStore, 'dispatch').and.callThrough();

    fixture.detectChanges();
  });

  it('should dispatch [Customer API] List customers initiated on init', () => {
    expect(mockStore.dispatch).toHaveBeenCalledWith(customerApiActions.listCustomersInitiated());
  });

  it('should render customer list with all customers', () => {
    const list = fixture.debugElement.query(By.css('household-customer-list'));
    expect(list.componentInstance.customers).toEqual(customers);
  });

  it('should render a create button in toolbar', () => {
    const button = fixture.debugElement.query(By.css('[data-testid="create-customer"]'));
    expect(button).toBeTruthy();
  });

  it('should dispatch [Customer] Create customer', () => {
    const button = fixture.debugElement.query(By.css('[data-testid="create-customer"]'));
    button.nativeElement.click();
    expect(mockStore.dispatch).toHaveBeenCalledWith(customerActions.createCustomer());
  });

  it('should filter customers by input value', () => {
    const input = fixture.debugElement.query(By.css('household-clearable-input input')).nativeElement as HTMLInputElement;
    input.value = searchedCustomer.name;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const list = fixture.debugElement.query(By.css('household-customer-list'));
    expect(list.componentInstance.customers).toEqual([searchedCustomer]);
    
  });
});
