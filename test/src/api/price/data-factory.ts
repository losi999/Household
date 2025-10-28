import { priceDocumentConverter } from '@household/shared/dependencies/converters/price-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Price } from '@household/shared/types/types';
import { testDataFactory } from '@household/shared/common/test-data-factory';

const createPriceDocument: DataFactoryFunction<Price.Request, Price.Document> = (req) => {
  return priceDocumentConverter.create(testDataFactory.price.request(req), Cypress.env('EXPIRES_IN'), true);
};
export const priceDataFactory = {
  id: testDataFactory.price.id,
  request: testDataFactory.price.request,
  document: createPriceDocument,
};
