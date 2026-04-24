import { priceService } from '@household/shared/dependencies/services/price-service';
import { IPriceService } from '@household/shared/services/price-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<IPriceService, 'savePrice' | 'savePrices' | 'findPriceById'>>({
  savePrice: async ({ logServiceCall }, use) => {
    const savePrice: IPriceService['savePrice'] = async (price) => {
      const result = await priceService.savePrice(price);
      await logServiceCall('savePrice', {
        price,
      }, result);
      return result;
    };

    await use(savePrice);
  },
  savePrices: async ({ logServiceCall }, use) => {
    const savePrices: IPriceService['savePrices'] = async (...prices) => {
      const result = await priceService.savePrices(...prices);
      await logServiceCall('savePrices', {
        prices,
      }, result);
      return result;
    };

    await use(savePrices);
  },
  findPriceById: async ({ logServiceCall }, use) => {
    const findPriceById: IPriceService['findPriceById'] = async (priceId) => {
      const result = await priceService.findPriceById(priceId);
      await logServiceCall('findPriceById', {
        priceId,
      }, result);
      return result;
    };

    await use(findPriceById);
  },
});
