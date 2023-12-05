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
    const document = await categoryService.getCategoryById(categoryId).catch(httpErrors.category.getById({
      categoryId,
    }));

    console.log(JSON.stringify(document, null, 2));

    httpErrors.category.notFound(!document, {
      categoryId,
    });

    return categoryDocumentConverter.toResponse(document);
  };
};
