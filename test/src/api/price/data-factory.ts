import { priceDocumentConverter } from '@household/shared/dependencies/converters/price-document-converter';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Price } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/api/utils';
import { priceUnitsOfMeasurement } from '@household/shared/constants';

export const priceDataFactory = (() => {
  const createPriceRequest: DataFactoryFunction<Price.Request> = (req) => {
    return {
      name: `${faker.commerce.department()} ${faker.string.uuid()}`,
      amount: faker.number.int({
        min: 0,
        max: 10000,
      }),
      unitOfMeasurement: faker.helpers.arrayElement(priceUnitsOfMeasurement),
      ...req,
    };
  };

  const createPriceDocument: DataFactoryFunction<Price.Request, Price.Document> = (req) => {
    return priceDocumentConverter.create(createPriceRequest(req), Cypress.env('EXPIRES_IN'), true);
  };

  return {
    id: (createId<Price.Id>),
    request: createPriceRequest,
    document: createPriceDocument,
  };
})();
