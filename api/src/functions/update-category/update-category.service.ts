import { httpError } from '@household/shared/common/utils';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { Category } from '@household/shared/types/types';

export interface IUpdateCategoryService {
  (ctx: {
    body: Category.Request;
    categoryId: Category.IdType;
    expiresIn: number;
  }): Promise<void>;
}

export const updateCategoryServiceFactory = (
  categoryService: ICategoryService,
  categoryDocumentConverter: ICategoryDocumentConverter,
): IUpdateCategoryService => {
  return async ({ body, categoryId, expiresIn }) => {
    const [
      { updatedAt, ...document },
      parentCategory,
    ] = await Promise.all([
      categoryService.getCategoryById(categoryId),
      categoryService.getCategoryById(body.parentCategoryId),
    ]).catch((error) => {
      console.error('Get category', error);
      throw httpError(500, 'Error while getting category');
    });

    if (!document) {
      throw httpError(404, 'No category found');
    }

    if (!parentCategory && body.parentCategoryId) {
      throw httpError(400, 'Parent category not found');
    }

    const updated = categoryDocumentConverter.update({
      document,
      body,
      parentCategory, 
    }, expiresIn);
    const oldFullName = document.fullName;

    await categoryService.updateCategory(updated, oldFullName).catch((error) => {
      console.error('Update category', error);
      throw httpError(500, 'Error while updating category');
    });
  };
};
