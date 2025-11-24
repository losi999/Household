import { testDataFactory } from '@household/shared/common/test-data-factory';
import { priceApiActions } from '@household/web/app/hairdressing/price/state/price.actions';
import { priceReducer, PriceState } from '@household/web/app/hairdressing/price/state/price.reducer';

describe('Price reducer', () => {
  let initialState: PriceState;

  beforeEach(() => {
    initialState = [];
  });

  it('should return the default state when an unknown action is used', () => {
    const action = {
      type: 'Unknown', 
    } as any;
    const state = priceReducer(initialState, action);
    expect(state).toBe(initialState);
  });

  describe('On List prices completed', () => {
    it('should set price list', () => {
      const priceResponse = testDataFactory.price.response();
      const action = priceApiActions.listPricesCompleted({
        prices: [priceResponse],
      });

      const state = priceReducer(initialState, action);
      expect(state).toEqual([priceResponse]);
    });
  });

  describe('On Create price completed', () => {
    it('should create price', () => {
      const existingPrice = testDataFactory.price.response({
        name: 'Z price',
      });

      initialState = [existingPrice];

      const priceId = testDataFactory.price.id();
      const request = testDataFactory.price.request({
        name: 'A price',
      });
      
      const action = priceApiActions.createPriceCompleted({
        ...request,
        priceId,
      });
      const state = priceReducer(initialState, action);
      expect(state).toEqual([
        {
          priceId,
          ...request,
        },
        existingPrice,
      ]);
    });
  });

  describe('On Update price completed', () => {
    it('should update price', () => {
      const priceId = testDataFactory.price.id();
      const existingPrice = testDataFactory.price.response({
        name: 'Z price',
      });
      const originalPrice = testDataFactory.price.response({
        priceId,
      });

      initialState = [
        existingPrice,
        originalPrice,
      ];
      const request = testDataFactory.price.request({
        name: 'A price',
      });
      
      const action = priceApiActions.createPriceCompleted({
        ...request,
        priceId,
      });
      const state = priceReducer(initialState, action);
      expect(state).toEqual([
        {
          priceId,
          ...request,
        },
        existingPrice,
      ]);
    });
  });

  describe('On Delete price completed', () => {
    it('should delete price', () => {
      const priceId = testDataFactory.price.id();
      const existingPrice = testDataFactory.price.response();
      const originalPrice = testDataFactory.price.response({
        priceId,
      });

      initialState = [
        existingPrice,
        originalPrice,
      ];
      
      const action = priceApiActions.deletePriceCompleted({
        priceId,
      });
      const state = priceReducer(initialState, action);
      expect(state).toEqual([existingPrice]);
    });
  });
});
