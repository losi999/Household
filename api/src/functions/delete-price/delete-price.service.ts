import { httpErrors } from '@household/api/common/error-handlers';
import { IPriceService } from '@household/shared/services/price-service';
import { Api } from '@household/shared/types/api';

export interface IDeletePriceService {
  (ctx: Api.Price.PriceId): Promise<unknown>;
}

export const deletePriceServiceFactory = (
  priceService: IPriceService): IDeletePriceService => {
  return ({ priceId }) => {
    return priceService.deletePrice(priceId).catch(httpErrors.price.delete({
      priceId,
    }));
  };
};
