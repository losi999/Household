import { httpErrors } from '@household/api/common/error-handlers';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
import { IPriceService } from '@household/shared/services/price-service';
import { Api } from '@household/shared/types/api';
import { ExpiresIn } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';

export interface IUpdatePriceService {
  (ctx: {
    body: Requests.Price;
  } & Api.Price.PriceId & ExpiresIn): Promise<unknown>;
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

    httpErrors.price.priceIsArchived(queried);

    const update = priceDocumentConverter.update(body, expiresIn);

    return priceService.updatePrice(priceId, update).catch(httpErrors.price.update({
      priceId,
      update,
    }));
  };
};
