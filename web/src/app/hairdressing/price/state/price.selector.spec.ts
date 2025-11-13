import { testDataFactory } from '@household/shared/common/test-data-factory';
import { PriceState } from '@household/web/app/hairdressing/price/state/price.reducer';
import { selectPrices } from '@household/web/app/hairdressing/price/state/price.selector';

describe('Price selector', () => {
  let state: PriceState;

  describe('Select prices', () => {
    it('should return price list', () => {
      const priceResponse = testDataFactory.price.response();
      state = [priceResponse];
      const result = selectPrices({
        prices: state,
      });
      expect(result).toEqual([priceResponse]);
      
    });
  });
});
