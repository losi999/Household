import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PriceHome } from './price-home';
import { createStubComponent, elementSelectorFactory, IElementSelector, MockSignalStore, provideMockDispatcher, provideMockSignalStore } from '@household/shared-ui';
import { Toolbar } from '@hairdressing/app/shared/toolbar/toolbar';
import { PriceList } from '@hairdressing/app/price/price-list/price-list';
import { PriceStore } from '@hairdressing/state/price/price-store';
import { priceApiEvents, priceEvents } from '@hairdressing/state/price/price-events';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { validateFunctionCall } from '@household/shared/common/unit-testing';
import { Dispatcher } from '@ngrx/signals/events';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { Responses } from '@household/shared/types/responses';

describe('PriceHome', () => {
  const ToolbarStub = createStubComponent(Toolbar);
  const PriceListStub = createStubComponent(PriceList);

  let fixture: ComponentFixture<PriceHome>;
  let selector: IElementSelector;
  let mockPriceStore: MockSignalStore<typeof PriceStore>;
  let mockDispatcher: Dispatcher;

  const prices = [
    testDataFactory.price.response(),
    testDataFactory.price.response(),
  ];

  const render = async (priceList: Responses.Price[] = prices) => {
    TestBed.resetTestingModule();

    await TestBed.configureTestingModule({
      imports: [PriceHome],
      providers: [
        provideMockSignalStore(PriceStore, 'priceList'),
        provideMockDispatcher(),
      ],
    })
      .overrideComponent(PriceHome, {
        remove: {
          imports: [
            Toolbar,
            PriceList,
          ],
        },
        add: {
          imports: [
            ToolbarStub,
            PriceListStub,
          ],
        },
      })
      .compileComponents();

    mockPriceStore = TestBed.inject<MockSignalStore<typeof PriceStore>>(PriceStore);
    mockDispatcher = TestBed.inject(Dispatcher);

    mockPriceStore.priceList.set(priceList);

    fixture = TestBed.createComponent(PriceHome);

    selector = elementSelectorFactory(fixture.debugElement);

    await fixture.whenStable();
  };

  describe('on init', () => {
    it('should dispatch listPricesInitiated', async () => {
      await render();

      validateFunctionCall(mockDispatcher.dispatch, priceApiEvents.listPricesInitiated(), {
        scope: 'self',
      });
    });
  });

  describe('toolbar', () => {
    it('should be rendered with the title', async () => {
      await render();

      expect(selector.getComponent<Toolbar>(ToolbarStub).componentInstance.title()).toBe('Árlista');
    });
  });

  describe('create button', () => {
    const getElement = () => {
      return selector.getComponent<MatIconButton, HTMLButtonElement>(MatIconButton, ToolbarStub);
    };

    it('should be rendered', async () => {
      await render();

      expect(selector.getComponent(MatIcon, ToolbarStub).nativeElement.textContent).toBe('add');
    });

    it('should dispatch createPrice if clicked', async () => {
      await render();

      getElement().nativeElement.click();

      validateFunctionCall(mockDispatcher.dispatch, priceEvents.createPrice(), {
        scope: 'self',
      });
    });
  });

  describe('price list', () => {
    it('should be rendered with the prices of the store', async () => {
      await render();

      expect(selector.getComponent<PriceList>(PriceListStub).componentInstance.prices()).toEqual(prices);
    });

    it('should be rendered with an empty list', async () => {
      await render([]);

      expect(selector.getComponent<PriceList>(PriceListStub).componentInstance.prices()).toEqual([]);
    });
  });
});
