import { testDataFactory } from '@household/shared/common/test-data-factory';
import { selectPriceList } from '@household/web/app/hairdressing/price/state/price.selector';

describe('Price selector', () => {
  it('Select price List should return price list', () => {
    const priceResponse = testDataFactory.price.response();
      
    const result = selectPriceList.projector([priceResponse]);
      
    expect(result).toEqual([priceResponse]);      
  });
});
