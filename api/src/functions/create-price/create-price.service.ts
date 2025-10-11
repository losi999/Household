import { httpErrors } from '@household/api/common/error-handlers';
import { getPriceId } from '@household/shared/common/utils';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
import { IPriceService } from '@household/shared/services/price-service';
import { Price } from '@household/shared/types/types';

export interface ICreatePriceService {
  (ctx: {
    body: Price.Request;
    expiresIn: number;
  }): Promise<Price.Id>;
}

export const createPriceServiceFactory = (
  priceService: IPriceService,
  priceDocumentConverter: IPriceDocumentConverter): ICreatePriceService => {
  return async ({ body, expiresIn }) => {
    const document = priceDocumentConverter.create(body, expiresIn);

    const saved = await priceService.savePrice(document).catch(httpErrors.price.save(document));

    return getPriceId(saved);
  };
};
