import { DataFactoryFunction } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';
import { Documents } from '@household/shared/types/documents';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/utils';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { unitsOfMeasurement } from '@household/shared/constants';
import { CategoryType } from '@household/shared/enums';

export const productDataFactory = (() => {
  const createProductRequest: DataFactoryFunction<Requests.Product> = (req) => {
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
    body?: Partial<Requests.Product>;
    category: Documents.Category;
  }): Documents.Product => {
    if (ctx.category.categoryType !== CategoryType.Inventory) {
      throw 'Category must be of inventory type';
    }

    return productDocumentConverter.create({
      body: createProductRequest({
        ...(ctx?.body ?? {}),
      }),
      category: ctx.category,
    }, Number(process.env.EXPIRES_IN), true);
  };
  return {
    request: createProductRequest,
    document: createProductDocument,
    id: (createId<Api.Product.Id>),
  };
})();
