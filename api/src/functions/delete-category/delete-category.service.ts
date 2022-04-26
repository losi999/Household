import { httpError } from '@household/shared/common/utils';
import { ICategoryService } from '@household/shared/services/category-service';
import { Category } from '@household/shared/types/types';

export interface IDeleteCategoryService {
  (ctx: {
    categoryId: Category.IdType;
  }): Promise<void>;
}

export const deleteCategoryServiceFactory = (
  categoryService: ICategoryService): IDeleteCategoryService => {
  return async ({ categoryId }) => {
    await categoryService.deleteCategory(categoryId).catch((error) => {
      console.error('Delete category', error);
      throw httpError(500, 'Error while deleting category');
    });
  };
};
