import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { getCategoryId } from '@household/shared/common/utils';
import { CategoryType } from '@household/shared/enums';
import { DataFactoryFunction } from '@household/shared/types/common';
import { Api } from '@household/shared/types/api';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/utils';

export const categoryDataFactory = (() => {
  const createCategoryRequest: DataFactoryFunction<Requests.Category> = (req) => {
    return {
      name: `${faker.company.name()} ${faker.string.uuid()}`,
      categoryType: faker.helpers.enumValue(CategoryType),
      parentCategoryId: undefined,
      ...req,
    };
  };

  const createCategoryDocument = (ctx?: {
    body?: Partial<Requests.Category>;
    parentCategory?: Documents.Category;
  }): Documents.Category => {
    return categoryDocumentConverter.create({
      body: createCategoryRequest({
        ...(ctx?.body ?? {}),
        parentCategoryId: getCategoryId(ctx?.parentCategory),
      }),
      parentCategory: ctx?.parentCategory,
    }, Number(process.env.EXPIRES_IN), true);
  };

  return {
    request: createCategoryRequest,
    document: createCategoryDocument,
    id: createId<Api.Category.Id>,
  };
})();
