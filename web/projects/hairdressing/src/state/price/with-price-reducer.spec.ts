import { TestBed } from '@angular/core/testing';
import { priceApiEvents } from '@hairdressing/state/price/price-events';
import { PriceState } from '@hairdressing/state/price/price-store';
import { withPriceReducer } from '@hairdressing/state/price/with-price-reducer';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { toSearchable } from '@household/shared/common/utils';
import { signalStore, withState } from '@ngrx/signals';
import { Dispatcher } from '@ngrx/signals/events';

const createTestStore = (state: PriceState) => {
  return signalStore({
    providedIn: 'root',
  }, withState<PriceState>(state), withPriceReducer());
};

describe('withPriceReducer', () => {
  let initialState: PriceState;
  let store: InstanceType<ReturnType<typeof createTestStore>>;
  let dispatcher: Dispatcher;

  const validateState = (currentValue?: Partial<PriceState>) => {
    expect(store.isInProgress(), 'isInProgress').toEqual(Object.hasOwn(currentValue ?? {}, 'isInProgress') ? currentValue.isInProgress : initialState.isInProgress);
    expect(store.priceList(), 'priceList').toEqual(Object.hasOwn(currentValue ?? {}, 'priceList') ? currentValue.priceList : initialState.priceList);
  };

  const setup = (initial?: Partial<PriceState>) => {
    TestBed.resetTestingModule();

    initialState = {
      isInProgress: [],
      priceList: [],
      ...initial,
    };

    store = TestBed.inject(createTestStore(initialState));
    dispatcher = TestBed.inject(Dispatcher);
  };

  beforeEach(() => {
    setup();
  });

  describe('listPricesCompleted', () => {
    it('should store the prices with their search terms', () => {
      const priceResponse = testDataFactory.price.response({
        name: 'ékezetes név',
      });

      dispatcher.dispatch(priceApiEvents.listPricesCompleted([priceResponse]));

      validateState({
        priceList: [
          {
            ...priceResponse,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });
  });

  describe('createPriceCompleted', () => {
    it('should add the price with its search terms', () => {
      const priceId = testDataFactory.price.id();
      const priceRequest = testDataFactory.price.request({
        name: 'ékezetes név',
      });

      dispatcher.dispatch(priceApiEvents.createPriceCompleted({
        priceId,
        ...priceRequest,
      }));

      validateState({
        priceList: [
          {
            priceId,
            ...priceRequest,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });

    it('should keep the prices ordered by name', () => {
      const lastPrice = testDataFactory.price.response({
        name: 'Zsolt',
      });
      setup({
        priceList: [toSearchable(lastPrice, ['name'])],
      });
      const priceId = testDataFactory.price.id();
      const priceRequest = testDataFactory.price.request({
        name: 'Ádám',
      });

      dispatcher.dispatch(priceApiEvents.createPriceCompleted({
        priceId,
        ...priceRequest,
      }));

      validateState({
        priceList: [
          toSearchable({
            priceId,
            ...priceRequest,
          }, ['name']),
          toSearchable(lastPrice, ['name']),
        ],
      });
    });
  });

  describe('updatePriceInitiated', () => {
    it('should mark the price as in progress', () => {
      const otherPriceId = testDataFactory.price.id();
      setup({
        isInProgress: [otherPriceId],
      });
      const priceId = testDataFactory.price.id();

      dispatcher.dispatch(priceApiEvents.updatePriceInitiated({
        priceId,
        ...testDataFactory.price.request(),
      }));

      validateState({
        isInProgress: [
          otherPriceId,
          priceId,
        ],
      });
    });
  });

  describe('updatePriceCompleted', () => {
    it('should replace the price and mark it as not in progress', () => {
      const originalPrice = testDataFactory.price.response();
      const otherPriceId = testDataFactory.price.id();
      setup({
        isInProgress: [
          originalPrice.priceId,
          otherPriceId,
        ],
        priceList: [toSearchable(originalPrice, ['name'])],
      });
      const priceRequest = testDataFactory.price.request({
        name: 'ékezetes név',
      });

      dispatcher.dispatch(priceApiEvents.updatePriceCompleted({
        priceId: originalPrice.priceId,
        ...priceRequest,
      }));

      validateState({
        isInProgress: [otherPriceId],
        priceList: [
          {
            priceId: originalPrice.priceId,
            ...priceRequest,
            searchTerms: expect.arrayContaining([
              'ekezetes',
              'nev',
              'ékezetes',
              'név',
            ]),
          },
        ],
      });
    });

    it('should keep the prices ordered by name', () => {
      const firstPrice = testDataFactory.price.response({
        name: 'Ádám',
      });
      const secondPrice = testDataFactory.price.response({
        name: 'Béla',
      });
      setup({
        isInProgress: [firstPrice.priceId],
        priceList: [
          toSearchable(firstPrice, ['name']),
          toSearchable(secondPrice, ['name']),
        ],
      });
      const priceRequest = testDataFactory.price.request({
        name: 'Zsolt',
      });

      dispatcher.dispatch(priceApiEvents.updatePriceCompleted({
        priceId: firstPrice.priceId,
        ...priceRequest,
      }));

      validateState({
        isInProgress: [],
        priceList: [
          toSearchable(secondPrice, ['name']),
          toSearchable({
            priceId: firstPrice.priceId,
            ...priceRequest,
          }, ['name']),
        ],
      });
    });
  });

  describe('updatePriceFailed', () => {
    it('should mark the price as not in progress', () => {
      const priceId = testDataFactory.price.id();
      const otherPriceId = testDataFactory.price.id();
      setup({
        isInProgress: [
          priceId,
          otherPriceId,
        ],
      });

      dispatcher.dispatch(priceApiEvents.updatePriceFailed({
        priceId,
      }));

      validateState({
        isInProgress: [otherPriceId],
      });
    });
  });

  describe('deletePriceInitiated', () => {
    it('should mark the price as in progress', () => {
      const otherPriceId = testDataFactory.price.id();
      setup({
        isInProgress: [otherPriceId],
      });
      const priceId = testDataFactory.price.id();

      dispatcher.dispatch(priceApiEvents.deletePriceInitiated({
        priceId,
      }));

      validateState({
        isInProgress: [
          otherPriceId,
          priceId,
        ],
      });
    });
  });

  describe('deletePriceCompleted', () => {
    it('should remove the price and mark it as not in progress', () => {
      const originalPrice = testDataFactory.price.response();
      const otherPrice = testDataFactory.price.response();
      setup({
        isInProgress: [originalPrice.priceId],
        priceList: [
          toSearchable(originalPrice, ['name']),
          toSearchable(otherPrice, ['name']),
        ],
      });

      dispatcher.dispatch(priceApiEvents.deletePriceCompleted({
        priceId: originalPrice.priceId,
      }));

      validateState({
        isInProgress: [],
        priceList: [toSearchable(otherPrice, ['name'])],
      });
    });
  });

  describe('deletePriceFailed', () => {
    it('should mark the price as not in progress', () => {
      const priceId = testDataFactory.price.id();
      const otherPriceId = testDataFactory.price.id();
      setup({
        isInProgress: [
          priceId,
          otherPriceId,
        ],
      });

      dispatcher.dispatch(priceApiEvents.deletePriceFailed({
        priceId,
      }));

      validateState({
        isInProgress: [otherPriceId],
      });
    });
  });
});
