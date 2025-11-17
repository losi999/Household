import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerHomeComponent } from '@household/web/app/hairdressing/customer/customer-home/customer-home.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AuthService } from '@household/web/services/auth.service';
import { Customer } from '@household/shared/types/types';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { customerActions, customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { provideRouter } from '@angular/router';
import { CustomerListComponent } from '@household/web/app/hairdressing/customer/customer-list/customer-list.component';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { MatIconButton } from '@angular/material/button';
import { elementSelectorFactory, IElementSelector } from '@household/web/testing/element-selector';
import { setValueOfClearableInput } from '@household/web/testing/utils';

describe('CustomerHomeComponent', () => {
  let fixture: ComponentFixture<CustomerHomeComponent>;
  let customers: Customer.Response[];
  let searchedCustomer: Customer.Response;
  let mockStore: MockStore;
  let selector: IElementSelector;

  beforeEach(async () => {
    searchedCustomer = testDataFactory.customer.response();
    customers = [
      searchedCustomer,
      testDataFactory.customer.response(),
    ];

    await TestBed.configureTestingModule({
      imports: [CustomerHomeComponent],
      providers: [
        provideRouter([]),
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
    
    selector = elementSelectorFactory(fixture.debugElement);

    fixture.detectChanges();
  });

  it('should dispatch [Customer API] List customers initiated on init', () => {
    expect(mockStore.dispatch).toHaveBeenCalledWith(customerApiActions.listCustomersInitiated());
  });

  it('should render customer list with all customers', () => {
    const list = selector.getComponent(CustomerListComponent);
    expect(list.componentInstance.customers).toEqual(customers);
  });

  describe('create customer button', () => {
    let button: HTMLButtonElement;
    
    beforeEach(() => {
      button = selector.getComponent<MatIconButton, HTMLButtonElement>(MatIconButton, ToolbarComponent).nativeElement;
    });

    it('should be rendered in toolbar', () => {
      expect(button).toBeTruthy();
    });
    
    it('click should dispatch [Customer] Create customer', () => {
      button.click();
      expect(mockStore.dispatch).toHaveBeenCalledWith(customerActions.createCustomer());
    });
  });

  it('should filter customers by input value', () => {
    setValueOfClearableInput(selector, searchedCustomer.name);
    
    fixture.detectChanges();

    const list = selector.getComponent(CustomerListComponent);
    expect(list.componentInstance.customers).toEqual([searchedCustomer]);
    
  });
});
