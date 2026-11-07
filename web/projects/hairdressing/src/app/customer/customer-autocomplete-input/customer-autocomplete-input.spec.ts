import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomerAutocompleteInput } from './customer-autocomplete-input';
import { CustomerStore } from '@hairdressing/state/customer/customer-store';
import { customerEvents } from '@hairdressing/state/customer/customer-events';
import { elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Api } from '@household/shared/types/api';
import { Searchable } from '@household/shared/types/common';
import { Responses } from '@household/shared/types/responses';
import { Dispatcher } from '@ngrx/signals/events';
import { MatIconButton } from '@angular/material/button';
import { MatError, MatLabel } from '@angular/material/form-field';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';

describe('CustomerAutocompleteInput', () => {
  let fixture: ComponentFixture<CustomerAutocompleteInput>;
  let selector: IElementSelector;
  let mockCustomerStore: MockSignalStore<typeof CustomerStore>;
  let mockDispatcher: Dispatcher;

  const anna: Searchable<Responses.Customer> = {
    ...testDataFactory.customer.response({
      name: 'Kovács Anna',
    }),
    searchTerms: ['kovács anna'],
  };
  const bela: Searchable<Responses.Customer> = {
    ...testDataFactory.customer.response({
      name: 'Nagy Béla',
    }),
    searchTerms: ['nagy béla'],
  };
  const cecil: Searchable<Responses.Customer> = {
    ...testDataFactory.customer.response({
      name: 'Szabó Cecil',
    }),
    searchTerms: ['szabó cecil'],
  };
  const archived: Searchable<Responses.Customer> = {
    ...testDataFactory.customer.response({
      name: 'Régi Vendég',
      isArchived: true,
    }),
    searchTerms: ['régi vendég'],
  };

  const customers = [
    anna,
    bela,
    cecil,
    archived,
  ];

  const getInput = () => {
    return selector.getElementByCss<HTMLInputElement>('input');
  };

  const getCreateButton = () => {
    return selector.listComponents<MatIconButton, HTMLButtonElement>(MatIconButton)[0];
  };

  const getClearButton = () => {
    return selector.listComponents<MatIconButton, HTMLButtonElement>(MatIconButton)[1];
  };

  const getTrigger = () => {
    return selector.getComponent<MatAutocompleteTrigger>(MatAutocompleteTrigger).injector.get(MatAutocompleteTrigger);
  };

  const getOptions = async () => {
    getTrigger().openPanel();

    await fixture.whenStable();

    return getTrigger().autocomplete.options.map(o => o.viewValue);
  };

  const type = async (value: string) => {
    getInput().nativeElement.value = value;
    getInput().nativeElement.dispatchEvent(new Event('input'));

    await fixture.whenStable();
  };

  const render = async (params?: {
    customerList?: Searchable<Responses.Customer>[];
    label?: string;
    exclude?: Api.Customer.Id[];
    value?: Responses.Customer;
    errors?: { kind: string; message: string }[];
    touched?: boolean;
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [CustomerAutocompleteInput],
      providers: [
        provideMockSignalStore(CustomerStore, 'customerList'),
        provideMockDispatcher(),
      ],
    })
      .compileComponents();

    mockCustomerStore = TestBed.inject<MockSignalStore<typeof CustomerStore>>(CustomerStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockCustomerStore.customerList.set(params?.customerList ?? customers);

    fixture = TestBed.createComponent(CustomerAutocompleteInput);
    fixture.componentRef.setInput('label', params?.label ?? 'Vendég');
    fixture.componentRef.setInput('exclude', params?.exclude ?? []);
    fixture.componentRef.setInput('value', params?.value);
    fixture.componentRef.setInput('errors', params?.errors ?? []);
    fixture.componentRef.setInput('touched', params?.touched ?? false);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('label', () => {
    it('should be rendered', async () => {
      await render({
        label: 'Tiltott vendég',
      });

      expect(selector.getComponent(MatLabel).nativeElement.textContent).toBe('Tiltott vendég');
    });
  });

  describe('input', () => {
    it('should be empty if there is no value', async () => {
      await render();

      expect(getInput().nativeElement.value).toBe('');
    });

    it('should display the name of the value', async () => {
      await render({
        value: bela,
      });

      expect(getInput().nativeElement.value).toBe(bela.name);
    });
  });

  describe('options', () => {
    it('should be every customer but the archived ones', async () => {
      await render();

      expect(await getOptions()).toEqual([
        anna.name,
        bela.name,
        cecil.name,
      ]);
    });

    it('should not contain the excluded customers', async () => {
      await render({
        exclude: [
          anna.customerId,
          cecil.customerId,
        ],
      });

      expect(await getOptions()).toEqual([bela.name]);
    });

    it('should be empty if there are no customers', async () => {
      await render({
        customerList: [],
      });

      expect(await getOptions()).toEqual([]);
    });

    it('should be filtered by the typed text', async () => {
      await render();

      await type('nagy');

      expect(await getOptions()).toEqual([bela.name]);
    });

    it('should be filtered by every term of the typed text', async () => {
      await render();

      await type('anna kov');

      expect(await getOptions()).toEqual([anna.name]);
    });

    it('should be empty if nothing matches the typed text', async () => {
      await render();

      await type('nobody');

      expect(await getOptions()).toEqual([]);
    });
  });

  describe('create button', () => {
    it('should dispatch createCustomer if clicked', async () => {
      await render();

      getCreateButton().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, customerEvents.createCustomer(), {
        scope: 'self',
      });
    });
  });

  describe('clear button', () => {
    it('should clear the value if clicked', async () => {
      await render({
        value: anna,
      });

      getClearButton().nativeElement.click();

      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toBeNull();
      expect(getInput().nativeElement.value).toBe('');
    });
  });

  describe('on blur', () => {
    it('should clear the value if the typed text differs from its name', async () => {
      await render({
        value: anna,
      });

      await type('Kovács');

      getInput().nativeElement.dispatchEvent(new Event('blur'));

      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toBeNull();
    });

    it('should keep the value if the text is its name', async () => {
      await render({
        value: anna,
      });

      getInput().nativeElement.dispatchEvent(new Event('blur'));

      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toEqual(anna);
    });
  });

  describe('errors', () => {
    it('should be displayed if touched', async () => {
      await render({
        errors: [
          {
            kind: 'required',
            message: 'Kötelező',
          },
        ],
        touched: true,
      });

      expect(selector.listComponents(MatError).map(e => e.nativeElement.textContent.trim())).toEqual(['Kötelező']);
    });

    it('should not be displayed if not touched', async () => {
      await render({
        errors: [
          {
            kind: 'required',
            message: 'Kötelező',
          },
        ],
      });

      expect(selector.listComponents(MatError)).toEqual([]);
    });
  });
});
