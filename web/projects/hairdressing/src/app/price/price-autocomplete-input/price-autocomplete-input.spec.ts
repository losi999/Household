import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceAutocompleteInput } from './price-autocomplete-input';
import { elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { PriceStore } from '@hairdressing/state/price/price-store';
import { priceEvents } from '@hairdressing/state/price/price-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { toSearchable } from '@household/shared/common/utils';
import { Dispatcher } from '@ngrx/signals/events';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';
import { Searchable } from '@household/shared/types/common';

describe('PriceAutocompleteInput', () => {
  let fixture: ComponentFixture<PriceAutocompleteInput>;
  let selector: IElementSelector;
  let mockPriceStore: MockSignalStore<typeof PriceStore>;
  let mockDispatcher: Dispatcher;

  const price1 = toSearchable(testDataFactory.price.response({
    name: 'Hajvágás',
  }), ['name']);
  const price2 = toSearchable(testDataFactory.price.response({
    name: 'Hajfestés hosszú',
  }), ['name']);
  const price3 = toSearchable(testDataFactory.price.response({
    name: 'Szemöldök',
  }), ['name']);
  const priceList = [
    price1,
    price2,
    price3,
  ];

  const getInput = () => {
    return selector.getElementByCss<HTMLInputElement>('input', MatFormField);
  };

  const getCreateButton = () => {
    return selector.listComponents<MatIconButton, HTMLButtonElement>(MatIconButton, MatFormField)[0];
  };

  const getClearButton = () => {
    return selector.listComponents<MatIconButton, HTMLButtonElement>(MatIconButton, MatFormField)[1];
  };

  const getOptions = () => {
    return Array.from(document.querySelectorAll('mat-option')).map(option => option.textContent.trim());
  };

  const openPanel = async () => {
    getInput().nativeElement.dispatchEvent(new Event('focusin'));
    await fixture.whenStable();
  };

  const type = async (text: string) => {
    getInput().nativeElement.value = text;
    getInput().nativeElement.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  const render = async (params?: {
    priceList?: Searchable<Responses.Price>[];
    value?: Responses.Price;
    exclude?: Api.Price.Id[];
    label?: string;
    touched?: boolean;
    errors?: { kind: string; message: string }[];
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [PriceAutocompleteInput],
      providers: [
        provideMockSignalStore(PriceStore, 'priceList'),
        provideMockDispatcher(),
      ],
    })
      .compileComponents();

    mockPriceStore = TestBed.inject<MockSignalStore<typeof PriceStore>>(PriceStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockPriceStore.priceList.set(params?.priceList ?? priceList);

    fixture = TestBed.createComponent(PriceAutocompleteInput);
    fixture.componentRef.setInput('label', params?.label ?? 'Ár');
    fixture.componentRef.setInput('exclude', params?.exclude ?? []);
    fixture.componentRef.setInput('errors', params?.errors ?? []);
    fixture.componentRef.setInput('touched', params?.touched ?? false);
    if (params?.value) {
      fixture.componentRef.setInput('value', params.value);
    }

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('label', () => {
    it('should be rendered', async () => {
      await render({
        label: 'Szolgáltatás',
      });

      expect(selector.getComponent(MatLabel, MatFormField).nativeElement.textContent).toBe('Szolgáltatás');
    });
  });

  describe('input', () => {
    it('should be empty if there is no value', async () => {
      await render();

      expect(getInput().nativeElement.value).toBe('');
    });

    it('should show the name of the value', async () => {
      await render({
        value: price1,
      });

      expect(getInput().nativeElement.value).toBe(price1.name);
    });
  });

  describe('options', () => {
    it('should list every price', async () => {
      await render();

      await openPanel();

      expect(getOptions()).toEqual([
        price1.name,
        price2.name,
        price3.name,
      ]);
    });

    it('should not list the excluded prices', async () => {
      await render({
        exclude: [price2.priceId],
      });

      await openPanel();

      expect(getOptions()).toEqual([
        price1.name,
        price3.name,
      ]);
    });

    it('should be filtered by the typed text', async () => {
      await render();

      await openPanel();
      await type('haj');

      expect(getOptions()).toEqual([
        price1.name,
        price2.name,
      ]);
    });

    it('should be filtered by every typed term', async () => {
      await render();

      await openPanel();
      await type('haj hosszu');

      expect(getOptions()).toEqual([price2.name]);
    });

    it('should be empty if nothing matches', async () => {
      await render();

      await openPanel();
      await type('nincs ilyen');

      expect(getOptions()).toEqual([]);
    });

    it('should be empty if the store has no prices', async () => {
      await render({
        priceList: [],
      });

      await openPanel();

      expect(getOptions()).toEqual([]);
    });
  });

  describe('clear button', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatIcon, getClearButton()).nativeElement.textContent).toBe('close');
    });

    it('should clear the value', async () => {
      await render({
        value: price1,
      });

      getClearButton().nativeElement.click();
      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toBeNull();
      expect(getInput().nativeElement.value).toBe('');
    });
  });

  describe('blur', () => {
    it('should clear the value if the typed text differs from its name', async () => {
      await render({
        value: price1,
      });

      await type('Haj');
      getInput().nativeElement.dispatchEvent(new Event('blur'));
      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toBeNull();
    });

    it('should keep the value if the typed text is unchanged', async () => {
      await render({
        value: price1,
      });

      getInput().nativeElement.dispatchEvent(new Event('blur'));
      await fixture.whenStable();

      expect(fixture.componentInstance.value()).toEqual(price1);
    });
  });

  describe('create button', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatIcon, getCreateButton()).nativeElement.textContent).toBe('library_add');
    });

    it('should dispatch createPrice if clicked', async () => {
      await render();

      getCreateButton().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, priceEvents.createPrice(), {
        scope: 'self',
      });
    });
  });

  describe('errors', () => {
    it('should not be rendered if there is none', async () => {
      await render();

      expect(selector.listComponents(MatError, MatFormField)).toEqual([]);
    });

    it('should be rendered with their messages', async () => {
      await render({
        errors: [
          {
            kind: 'required',
            message: 'Kötelező',
          },
        ],
        touched: true,
      });

      // The error state of the input is only re-evaluated on the next view check, which typing triggers
      await type('');

      expect(selector.listComponents(MatError, MatFormField).map(e => e.nativeElement.textContent.trim())).toEqual(['Kötelező']);
    });
  });
});
