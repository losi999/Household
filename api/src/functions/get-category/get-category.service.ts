import { httpErrors } from '@household/api/common/error-handlers';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

export interface IGetCategoryService {
  (ctx: Api.Category.CategoryId): Promise<Responses.Category>;
}

export const getCategoryServiceFactory = (
  categoryService: ICategoryService,
  categoryDocumentConverter: ICategoryDocumentConverter): IGetCategoryService => {
  return async ({ categoryId }) => {
    const category = await categoryService.getCategoryById(categoryId).catch(httpErrors.category.getById({
      categoryId,
    }));

    httpErrors.category.notFound({
      category,
      categoryId,
    });

    return categoryDocumentConverter.toResponse(category);
  };
};
