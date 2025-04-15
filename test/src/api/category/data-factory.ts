import { DataFactoryFunction } from '@household/shared/types/common';
import { Category } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { createId } from '@household/test/api/utils';
import { categoryDocumentConverter } from '@household/shared/dependencies/converters/category-document-converter';
import { getCategoryId } from '@household/shared/common/utils';
import { CategoryType } from '@household/shared/enums';

export const categoryDataFactory = (() => {
  const createCategoryRequest: DataFactoryFunction<Category.Request> = (req) => {
    return {
      name: `${faker.company.name()} ${faker.string.uuid()}`,
      categoryType: faker.helpers.enumValue(CategoryType),
      parentCategoryId: undefined,
      ...req,
    };
  };

  const createCategoryDocument = (ctx?: {
    body?: Partial<Category.Request>;
    parentCategory?: Category.Document;
  }): Category.Document => {
    return categoryDocumentConverter.create({
      body: createCategoryRequest({
        ...(ctx?.body ?? {}),
        parentCategoryId: getCategoryId(ctx?.parentCategory),
      }),
      parentCategory: ctx?.parentCategory,
    }, Cypress.env('EXPIRES_IN'), true);
  };
  return {
    request: createCategoryRequest,
    document: createCategoryDocument,
    id: (createId<Category.Id>),
  };
})();
