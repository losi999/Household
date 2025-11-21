import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerDetailsComponent } from '@household/web/app/hairdressing/customer/customer-details/customer-details.component';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ToolbarComponent } from '@household/web/app/shared/toolbar/toolbar.component';
import { AuthService } from '@household/web/services/auth.service';
import { customerActions, customerApiActions } from '@household/web/app/hairdressing/customer/state/customer.actions';
import { priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
import { Calendar, Customer } from '@household/shared/types/types';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { CustomerState } from '@household/web/app/hairdressing/customer/state/customer.reducer';
import { ProgressState } from '@household/web/state/progress/progress.reducer';
import { MatIconButton } from '@angular/material/button';
import { CustomerDetailsWorksComponent } from '@household/web/app/hairdressing/customer/customer-details-works/customer-details-works.component';
import { CustomerDetailsJobItemComponent } from '@household/web/app/hairdressing/customer/customer-details-job-item/customer-details-job-item.component';
import { elementSelectorFactory, IElementSelector } from '@household/web/testing/element-selector';
import { createMockService } from '@household/web/utils/unit-testing';

describe.skip('CustomerDetailsComponent', () => {
  let fixture: ComponentFixture<CustomerDetailsComponent>;
  let mockStore: MockStore;
  let customerId: Customer.Id;
  let customer: Customer.Response;
  let customerWorks: Calendar.Entry.WorkEntryResponseBase[];
  let selector: IElementSelector;

  let initialState: {
    customers: CustomerState;
    progress: Partial<ProgressState>;
  };

  const render = () => {
    mockStore.setState({
      customers: {
        customerList: [customer],
        customerWorks: {
          [customerId]: customerWorks,
        },
      },
      progress: {},
    });
    fixture.detectChanges();
  };

  beforeEach(async () => {
    customerId = testDataFactory.customer.id();
    customer = testDataFactory.customer.response({
      customerId,
    });
    initialState = {
      customers: {
        customerList: [customer],
      },
      progress: {},
    };

    await TestBed.configureTestingModule({
      imports: [CustomerDetailsComponent],
      providers: [
        provideMockStore({
          initialState,
        }),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({
                customerId, 
              }),
            },
          },
        },
        {
          provide: AuthService,
          useValue: createMockService<AuthService>('isLoggedIn'), 
        },
      ],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerDetailsComponent);
    mockStore = TestBed.inject(MockStore);

    vitest.spyOn(mockStore, 'dispatch');

    selector = elementSelectorFactory(fixture.debugElement);

    fixture.detectChanges();
  });

  describe('on init', () => {
    it('should dispatch [Customer API] List customers initiated', () => {
      expect(mockStore.dispatch).toHaveBeenCalledWith(customerApiActions.listCustomersInitiated());
    });
  
    it('should dispatch [Customer API] List customer works initiated', () => {
      expect(mockStore.dispatch).toHaveBeenCalledWith(customerApiActions.listCustomerWorksInitiated({
        customerId,
      }));
    });
  
    it('should dispatch [Price API] List prices initiated', () => {
      expect(mockStore.dispatch).toHaveBeenCalledWith(priceApiActions.listPricesInitiated());
    });
  });

  describe('edit customer button in toolbar', () => {
    it('should be rendered', () => {
      const button = selector.getComponent(MatIconButton, ToolbarComponent);
      
      expect(button).toBeTruthy();
    });
    
    it('(click) should dispatch [Customer] Create customer', () => {
      const button = selector.getComponent<MatIconButton, HTMLButtonElement>(MatIconButton, ToolbarComponent);
      button.nativeElement.click();
      
      expect(mockStore.dispatch).toHaveBeenCalledWith(customerActions.updateCustomer({
        customerId,
      }));
    });
  });

  describe('customer name', () => {
    it('should be rendered', () => {
      const element = selector.getComponentByTestId('name').nativeElement;
      
      expect(element.textContent.trim()).toEqual(customer.name);
    });
  });

  describe('customer rating', () => {
    it('should be rendered', () => {
      const element = selector.getComponentByTestId('rating').nativeElement;

      expect(element).toBeTruthy();
    });

    for (let r = 1; r <= 5; r += 1) {
      it(`icon #${r} should be green if selected`, () => {
        customer = testDataFactory.customer.response({
          customerId,
          rating: r,
        });
        render();

        const element = selector.getComponentByTestId('rating');
        element.children.forEach((child, index) => {
          if (index + 1 === r) {
            expect(child.classes.green).toBe(true);
          } else {
            expect(child.classes.green).toBeUndefined();
          }
        });
      });
    }
  });

  describe('customer description', () => {
    it('should be rendered', () => {
      const element = selector.getComponentByTestId('description').nativeElement;

      expect(element.textContent.trim()).toEqual(customer.description);
    });

    it('should NOT be rendered if not set', () => {
      customer = testDataFactory.customer.response({
        customerId,
        description: undefined,
      });

      render();

      const element = selector.getComponentByTestId('description');
      expect(element).toBeFalsy();
    });
  });

  describe('upcoming works', () => {
    it('should be rendered', () => {
      customerWorks = [
        testDataFactory.calendar.entry.response.workBase({
          day: testDataFactory.calendar.day.futureDay(),
        }),
      ];

      render();

      const element = selector.getComponentByTestId<CustomerDetailsWorksComponent>('upcoming-works');
      expect(element.componentInstance.works).toEqual(customerWorks);
      expect(element.componentInstance.pageSize).toEqual(3);
    });
  });

  describe('create new job button', () => {
    it('should be rendered', () => {
      const button = selector.getComponentByTestId<HTMLButtonElement>('new-job');
      expect(button).toBeTruthy();
    });

    it('(click) should dispatch [Customer] Create customer job', () => {
      const button = selector.getComponentByTestId<HTMLButtonElement>('new-job');
      button.nativeElement.click();
      
      expect(mockStore.dispatch).toHaveBeenCalledWith(customerActions.createCustomerJob({
        customerId,
      }));
    });
  });

  describe('jobs list', () => {
    it('should be rendered for each job', () => {
      customer = testDataFactory.customer.response({
        customerId,
        jobs: [
          testDataFactory.customer.job.response(),
          testDataFactory.customer.job.response(),
        ],
      });

      render();
      
      const elements = selector.listComponents(CustomerDetailsJobItemComponent);
      expect(elements.length).toEqual(customer.jobs.length);
      elements.forEach((element, index) => {
        expect(element.componentInstance.job).toEqual(customer.jobs[index]);
      });
    });
  });

  describe('past works', () => {
    it('should be rendered', () => {
      customerWorks = [
        testDataFactory.calendar.entry.response.workBase({
          day: testDataFactory.calendar.day.pastDay(),
        }),
      ];

      render();

      const element = selector.getComponentByTestId<CustomerDetailsWorksComponent>('past-works');
      expect(element.componentInstance.works).toEqual(customerWorks);
    });
  });

  describe('add to blacklist button', () => {
    it('should be rendered', () => {
      const button = selector.getComponentByTestId<HTMLButtonElement>('add-to-blacklist');
      expect(button).toBeTruthy();
    });

    it('(click) should dispatch [Customer] Create customer job', () => {
      const button = selector.getComponentByTestId<HTMLButtonElement>('add-to-blacklist');
      button.nativeElement.click();
      
      expect(mockStore.dispatch).toHaveBeenCalledWith(customerActions.addCustomerToBlacklist({
        customerId,
      }));
    });
  });

  describe('blacklisted customers list', () => {
    it('should render message if nobody is blacklisted', () => {
      const messageElement = selector.getComponentByTestId('empty-blacklist');
      const blacklistElement = selector.getComponentByTestId('blacklist');
      
      expect(messageElement).toBeTruthy();
      expect(blacklistElement).toBeFalsy();
    });

    it('should render list of blacklisted customers', () => {
      const blacklistedCustomer = testDataFactory.customer.response();
      customer = testDataFactory.customer.response({
        customerId,
        blacklistedCustomers: [blacklistedCustomer],
      });

      render();

      const messageElement = selector.getComponentByTestId('empty-blacklist');
      const blacklistElement = selector.getComponentByTestId('blacklist');

      expect(messageElement).toBeFalsy();
      expect(selector.getComponentByCss('div', blacklistElement).nativeElement.textContent.trim()).toEqual(blacklistedCustomer.name);
    });

    it('click on delete button should dispatch [Customer] Delete customer from blacklist', () => {
      const blacklistedCustomer = testDataFactory.customer.response();
      customer = testDataFactory.customer.response({
        customerId,
        blacklistedCustomers: [blacklistedCustomer],
      });

      render();

      const blacklistElement = selector.getComponentByTestId('blacklist');

      const deleteButton = selector.getComponent<MatIconButton, HTMLButtonElement>(MatIconButton, blacklistElement);

      deleteButton.nativeElement.click();

      expect(mockStore.dispatch).toHaveBeenCalledWith(customerActions.deleteCustomerFromBlacklist({
        customerId,
        selectedCustomer: blacklistedCustomer,
      }));
    });
  });
});
