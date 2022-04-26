import { httpError } from '@household/shared/common/utils';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { Category } from '@household/shared/types/types';

export interface IGetCategoryService {
  (ctx: {
    categoryId: Category.IdType;
  }): Promise<Category.Response>;
}

export const getCategoryServiceFactory = (
  categoryService: ICategoryService,
  categoryDocumentConverter: ICategoryDocumentConverter): IGetCategoryService => {
  return async ({ categoryId }) => {

    const document = await categoryService.getCategoryById(categoryId).catch((error) => {
      console.error('Get category', error);
      throw httpError(500, 'Error while getting category');
    });

    if (!document) {
      throw httpError(404, 'No category found');
    }

    return categoryDocumentConverter.toResponse(document);
  };
};
