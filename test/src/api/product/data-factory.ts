import { Requests } from '@household/shared/types/requests';
import { Documents } from '@household/shared/types/documents';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { CategoryType } from '@household/shared/enums';
import { testDataFactory } from '@household/shared/common/test-data-factory';

export const productDataFactory = (() => {
  const createProductDocument = (ctx: {
    body?: Partial<Requests.Product>;
    category: Documents.Category;
  }): Documents.Product => {
    if (ctx.category.categoryType !== CategoryType.Inventory) {
      throw 'Category must be of inventory type';
    }

    return productDocumentConverter.create({
      body: testDataFactory.product.request({
        ...(ctx?.body ?? {}),
      }),
      category: ctx.category,
    }, Number(process.env.EXPIRES_IN), true);
  };
  return {
    request: testDataFactory.product.request,
    document: createProductDocument,
    id: testDataFactory.product.id,
  };
})();
