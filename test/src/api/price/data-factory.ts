import { testDataFactory } from '@household/shared/common/test-data-factory';
import { priceDocumentConverter } from '@household/shared/dependencies/converters/price-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';

const createPriceDocument: DataFactoryFunction<Requests.Price, Documents.Price> = (req) => {
  return priceDocumentConverter.create(testDataFactory.price.request(req), Number(process.env.EXPIRES_IN), true);
};
export const priceDataFactory = {
  id: testDataFactory.price.id,
  request: testDataFactory.price.request,
  document: createPriceDocument,
};
