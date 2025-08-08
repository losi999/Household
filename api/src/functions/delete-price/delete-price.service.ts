import { httpErrors } from '@household/api/common/error-handlers';
import { IPriceService } from '@household/shared/services/price-service';
import { Price } from '@household/shared/types/types';

export interface IDeletePriceService {
  (ctx: {
    priceId: Price.Id;
  }): Promise<unknown>;
}

export const deletePriceServiceFactory = (
  priceService: IPriceService): IDeletePriceService => {
  return ({ priceId }) => {
    return priceService.deletePrice(priceId).catch(httpErrors.price.delete({
      priceId,
    }));
  };
};
