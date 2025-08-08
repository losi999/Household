import { httpErrors } from '@household/api/common/error-handlers';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
import { IPriceService } from '@household/shared/services/price-service';
import { Price } from '@household/shared/types/types';

export interface IListPricesService {
  (): Promise<Price.Response[]>;
}

export const listPricesServiceFactory = (
  priceService: IPriceService,
  priceDocumentConverter: IPriceDocumentConverter): IListPricesService => {
  return async () => {
    const documents = await priceService.listPrices().catch(httpErrors.price.list());

    return priceDocumentConverter.toResponseList(documents);
  };
};
