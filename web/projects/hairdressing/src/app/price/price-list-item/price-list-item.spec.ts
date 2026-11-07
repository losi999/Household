import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceListItem } from './price-list-item';
import { elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { priceEvents } from '@hairdressing/state/price/price-events';
import { PriceStore } from '@hairdressing/state/price/price-store';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { MatListItem, MatListItemLine, MatListItemTitle } from '@angular/material/list';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

describe('PriceListItem', () => {
  let fixture: ComponentFixture<PriceListItem>;
  let selector: IElementSelector;
  let mockPriceStore: MockSignalStore<typeof PriceStore>;
  let mockDispatcher: Dispatcher;

  const price = testDataFactory.price.response({
    unitOfMeasurement: 'db',
  });

  const render = async (params?: {
    isInProgress?: Api.Price.Id[];
    price?: Responses.Price;
  }) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [PriceListItem],
      providers: [
        provideMockSignalStore(PriceStore, 'isInProgress'),
        provideMockDispatcher(),
      ],
    })
      .compileComponents();

    mockPriceStore = TestBed.inject<MockSignalStore<typeof PriceStore>>(PriceStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockPriceStore.isInProgress.set(params?.isInProgress ?? []);

    fixture = TestBed.createComponent(PriceListItem);
    fixture.componentRef.setInput('price', params?.price ?? price);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('list item button', () => {
    const getElement = () => {
      return selector.getComponent<MatListItem, HTMLButtonElement>(MatListItem);
    };

    it('should be rendered', async () => {
      await render();

      expect(getElement()).toBeTruthy();
    });

    it('should be enabled if price is not in progress', async () => {
      await render({
        isInProgress: [testDataFactory.price.id()],
      });

      expect(getElement().nativeElement.disabled).toBe(false);
    });

    it('should be disabled if price is in progress', async () => {
      await render({
        isInProgress: [price.priceId],
      });

      expect(getElement().nativeElement.disabled).toBe(true);
    });

    describe('on click', () => {
      it('should dispatch openPriceListItemSubmenu', async () => {
        await render();

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch, priceEvents.openPriceListItemSubmenu(price), {
          scope: 'self',
        });
      });

      it('should not dispatch anything if disabled', async () => {
        await render({
          isInProgress: [price.priceId],
        });

        getElement().nativeElement.click();

        validateFunctionCall(mockDispatcher.dispatch);
      });
    });
  });

  describe('name', () => {
    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatListItemTitle, MatListItem).nativeElement.textContent).toBe(price.name);
    });
  });

  describe('amount line', () => {
    const getLine = () => {
      return selector.getComponent(MatListItemLine, MatListItem).nativeElement.textContent.replace(/\s+/g, ' ')
        .trim();
    };

    it('should show only the amount for the default unit', async () => {
      await render();

      expect(getLine()).toBe(`${price.amount} Ft`);
    });

    it('should show the unit of measurement otherwise', async () => {
      const kgPrice = testDataFactory.price.response({
        unitOfMeasurement: 'g',
      });

      await render({
        price: kgPrice,
      });

      expect(getLine()).toBe(`${kgPrice.amount} Ft / g`);
    });
  });
});
