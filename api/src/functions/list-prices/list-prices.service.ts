import { httpErrors } from '@household/api/common/error-handlers';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
import { IPriceService } from '@household/shared/services/price-service';
import { Responses } from '@household/shared/types/responses';

export interface IListPricesService {
  (): Promise<Responses.Price[]>;
}

export const listPricesServiceFactory = (
  priceService: IPriceService,
  priceDocumentConverter: IPriceDocumentConverter): IListPricesService => {
  return async () => {
    const documents = await priceService.listPrices().catch(httpErrors.price.list());

    return priceDocumentConverter.toResponseList(documents);
  };
};
