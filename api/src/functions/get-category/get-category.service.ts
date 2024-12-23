import { httpErrors } from '@household/api/common/error-handlers';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { Category } from '@household/shared/types/types';

export interface IGetCategoryService {
  (ctx: Category.CategoryId): Promise<Category.Response>;
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
