import { priceService } from '@household/shared/dependencies/services/price-service';
import { IPriceService } from '@household/shared/services/price-service';
import { test as baseTest } from '@household/test/fixtures/logging.fixture';

export const test = baseTest.extend<Pick<IPriceService, 'savePrice' | 'savePrices' | 'findPriceById'>>({
  savePrice: async ({ logDbCall }, use) => {
    const savePrice: IPriceService['savePrice'] = async (price) => {
      const result = await priceService.savePrice(price);
      await logDbCall('savePrice', {
        price,
      }, result);
      return result;
    };

    await use(savePrice);
  },
  savePrices: async ({ logDbCall }, use) => {
    const savePrices: IPriceService['savePrices'] = async (...prices) => {
      const result = await priceService.savePrices(...prices);
      await logDbCall('savePrices', {
        prices,
      }, result);
      return result;
    };

    await use(savePrices);
  },
  findPriceById: async ({ logDbCall }, use) => {
    const findPriceById: IPriceService['findPriceById'] = async (priceId) => {
      const result = await priceService.findPriceById(priceId);
      await logDbCall('findPriceById', {
        priceId,
      }, result);
      return result;
    };

    await use(findPriceById);
  },
});
