import { httpErrors } from '@household/api/common/error-handlers';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
import { IPriceService } from '@household/shared/services/price-service';
import { Price } from '@household/shared/types/types';

export interface IUpdatePriceService {
  (ctx: {
    body: Price.Request;
    priceId: Price.Id;
    expiresIn: number;
  }): Promise<unknown>;
}

export const updatePriceServiceFactory = (
  priceService: IPriceService,
  priceDocumentConverter: IPriceDocumentConverter,
): IUpdatePriceService => {
  return async ({ body, priceId, expiresIn }) => {
    const queried = await priceService.findPriceById(priceId).catch(httpErrors.price.getById({
      priceId,
    }));

    httpErrors.price.notFound({
      price: queried,
      priceId,
    });

    const update = priceDocumentConverter.update(body, expiresIn);

    return priceService.updatePrice(priceId, update).catch(httpErrors.price.update({
      priceId,
      update,
    }));
  };
};
