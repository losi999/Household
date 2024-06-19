import { DataFactoryFunction } from '@household/shared/types/common';
import { Category, Product } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/api/utils';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { unitsOfMeasurement } from '@household/shared/constants';

export const productDataFactory = (() => {
  const createProductRequest: DataFactoryFunction<Product.Request> = (req) => {
    return {
      brand: faker.commerce.productName(),
      measurement: faker.number.float({
        min: 0,
        max: 10000,
      }),
      unitOfMeasurement: faker.helpers.arrayElement(unitsOfMeasurement),
      ...req,
    };
  };

  const createProductDocument = (ctx: {
    body?: Partial<Product.Request>;
    category: Category.Document;
  }): Product.Document => {
    if (ctx.category.categoryType !== 'inventory') {
      throw 'Category must be of inventory type';
    }

    return productDocumentConverter.create({
      body: createProductRequest({
        ...(ctx?.body ?? {}),
      }),
      category: ctx.category,
    }, Cypress.env('EXPIRES_IN'), true);
  };
  return {
    request: createProductRequest,
    document: createProductDocument,
    id: (createId<Product.Id>),
  };
})();
