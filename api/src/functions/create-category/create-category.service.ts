import { httpErrors } from '@household/api/common/error-handlers';
import { getCategoryId } from '@household/shared/common/utils';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { Api } from '@household/shared/types/api';
import { ExpiresIn } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';

export interface ICreateCategoryService {
  (ctx: {
    body: Requests.Category;
  } & ExpiresIn): Promise<Api.Category.Id>;
}

export const createCategoryServiceFactory = (
  categoryService: ICategoryService,
  categoryDocumentConverter: ICategoryDocumentConverter): ICreateCategoryService => {
  return async ({ body, expiresIn }) => {
    const parentCategory = await categoryService.findCategoryById(body.parentCategoryId).catch(httpErrors.category.getById({
      categoryId: body.parentCategoryId,
    }));

    httpErrors.category.parentNotFound({
      parentCategoryId: body.parentCategoryId,
      parentCategory,
    });

    const document = categoryDocumentConverter.create({
      body,
      parentCategory,
    }, expiresIn);

    const saved = await categoryService.saveCategory(document).catch(httpErrors.category.save(document));

    return getCategoryId(saved);
  };
};
