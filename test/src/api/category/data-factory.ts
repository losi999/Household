import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { getCategoryId } from '@household/shared/common/utils';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { testDataFactory } from '@household/shared/common/test-data-factory';

export const categoryDataFactory = (() => {
  const createCategoryDocument = (ctx?: {
    body?: Partial<Requests.Category>;
    parentCategory?: Documents.Category;
  }): Documents.Category => {
    return categoryDocumentConverter.create({
      body: testDataFactory.category.request({
        ...(ctx?.body ?? {}),
        parentCategoryId: getCategoryId(ctx?.parentCategory),
      }),
      parentCategory: ctx?.parentCategory,
    }, Number(process.env.EXPIRES_IN), true);
  };

  return {
    request: testDataFactory.category.request,
    document: createCategoryDocument,
    id: testDataFactory.category.id,
  };
})();
