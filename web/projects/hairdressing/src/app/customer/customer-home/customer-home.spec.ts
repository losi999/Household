import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerHome } from './customer-home';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { CustomerList } from '@hairdressing/app/customer/customer-list/customer-list';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { customerApiEvents, customerEvents } from '@hairdressing/state/customer/customer-events';
import { ClearableInput, createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Searchable } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { Dispatcher } from '@ngrx/signals/events';
import { provideRouter } from '@angular/router';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

describe('CustomerHome', () => {
  const ToolbarStub = createStubComponent(Toolbar);
  const ClearableInputStub = createStubComponent(ClearableInput);
  const CustomerListStub = createStubComponent(CustomerList);

  let fixture: ComponentFixture<CustomerHome>;
  let selector: IElementSelector;
  let mockCustomerStore: MockSignalStore<typeof CustomerStore>;
  let mockDispatcher: Dispatcher;

  const activeCustomer: Searchable<Responses.Customer> = {
    ...testDataFactory.customer.response(),
    searchTerms: ['kovacs anna'],
  };
  const otherCustomer: Searchable<Responses.Customer> = {
    ...testDataFactory.customer.response(),
    searchTerms: ['nagy bela'],
  };
  const archivedCustomer: Searchable<Responses.Customer> = {
    ...testDataFactory.customer.response({
      isArchived: true,
    }),
    searchTerms: ['szabo cecil'],
  };

  const customers = [
    activeCustomer,
    otherCustomer,
    archivedCustomer,
  ];

  const getToolbar = () => {
    return selector.getComponent<Toolbar>(ToolbarStub);
  };

  const getJobsLink = () => {
    return selector.getComponent<MatIconButton, HTMLAnchorElement>(MatIconButton, ToolbarStub);
  };

  const getCreateButton = () => {
    return selector.listComponents<MatIconButton, HTMLButtonElement>(MatIconButton, ToolbarStub)[1];
  };

  const getToggle = () => {
    return selector.getComponent<MatSlideToggle>(MatSlideToggle);
  };

  const getSearchInput = () => {
    return selector.getComponent<ClearableInput>(ClearableInputStub);
  };

  const getList = () => {
    return selector.getComponent<CustomerList>(CustomerListStub);
  };

  const render = async (customerList: Searchable<Responses.Customer>[] = customers) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [CustomerHome],
      providers: [
        provideMockSignalStore(CustomerStore, 'customerList'),
        provideMockDispatcher(),
        provideRouter([]),
      ],
    })
      .overrideComponent(CustomerHome, {
        remove: {
          imports: [
            Toolbar,
            ClearableInput,
            CustomerList,
          ],
        },
        add: {
          imports: [
            ToolbarStub,
            ClearableInputStub,
            CustomerListStub,
          ],
        },
      })
      .compileComponents();

    mockCustomerStore = TestBed.inject<MockSignalStore<typeof CustomerStore>>(CustomerStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockCustomerStore.customerList.set(customerList);

    fixture = TestBed.createComponent(CustomerHome);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('on init', () => {
    it('should dispatch listCustomersInitiated', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch, customerApiEvents.listCustomersInitiated(), {
        scope: 'self',
      });
    });
  });

  describe('toolbar', () => {
    it('should be rendered with the title', async () => {
      await render();

      expect(getToolbar().componentInstance.title()).toBe('Vendégek');
    });
  });

  describe('jobs link', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatIcon, ToolbarStub).nativeElement.textContent).toBe('format_list_bulleted');
      expect(getJobsLink().nativeElement.getAttribute('href')).toBe('/jobs');
    });
  });

  describe('create button', () => {
    it('should be rendered', async () => {
      await render();

      expect(getCreateButton().nativeElement.textContent).toContain('add');
    });

    it('should dispatch createCustomer if clicked', async () => {
      await render();

      getCreateButton().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.createCustomer(), {
        scope: 'self',
      });
    });
  });

  describe('archived customers toggle', () => {
    it('should be unchecked and say the old customers are hidden by default', async () => {
      await render();

      expect(getToggle().componentInstance.checked).toBe(false);
      expect(getToggle().nativeElement.textContent).toContain('Régi vendégek elrejtve');
    });

    it('should say the old customers are shown if checked', async () => {
      await render();

      getToggle().nativeElement.querySelector('button').click();

      await fixture.whenStable();

      expect(getToggle().componentInstance.checked).toBe(true);
      expect(getToggle().nativeElement.textContent).toContain('Régi vendégek megjelenítve');
    });
  });

  describe('search input', () => {
    it('should be rendered empty', async () => {
      await render();

      expect(getSearchInput().componentInstance.label()).toBe('Keresés');
      expect(getSearchInput().componentInstance.value()).toBe('');
    });
  });

  describe('customer list', () => {
    it('should be rendered without the archived customers', async () => {
      await render();

      expect(getList().componentInstance.customers()).toEqual([
        activeCustomer,
        otherCustomer,
      ]);
    });

    it('should be rendered with the archived customers if the toggle is checked', async () => {
      await render();

      getToggle().nativeElement.querySelector('button').click();

      await fixture.whenStable();

      expect(getList().componentInstance.customers()).toEqual(customers);
    });

    it('should be rendered with an empty list', async () => {
      await render([]);

      expect(getList().componentInstance.customers()).toEqual([]);
    });

    it('should be filtered by the search value', async () => {
      await render();

      getSearchInput().componentInstance.value.set('kovacs');

      await fixture.whenStable();

      expect(getList().componentInstance.customers()).toEqual([activeCustomer]);
    });

    it('should be filtered by every term of the search value', async () => {
      await render();

      getSearchInput().componentInstance.value.set('anna kov');

      await fixture.whenStable();

      expect(getList().componentInstance.customers()).toEqual([activeCustomer]);
    });

    it('should be empty if nothing matches the search value', async () => {
      await render();

      getSearchInput().componentInstance.value.set('nobody');

      await fixture.whenStable();

      expect(getList().componentInstance.customers()).toEqual([]);
    });
  });
});
