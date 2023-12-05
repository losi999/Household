import { httpErrors } from '@household/api/common/error-handlers';
import { ICategoryService } from '@household/shared/services/category-service';
import { Category } from '@household/shared/types/types';

export interface IDeleteCategoryService {
  (ctx: {
    categoryId: Category.Id;
  }): Promise<void>;
}

export const deleteCategoryServiceFactory = (
  categoryService: ICategoryService): IDeleteCategoryService => {
  return async ({ categoryId }) => {
    await categoryService.deleteCategory(categoryId).catch(httpErrors.category.delete({
      categoryId,
    }));
  };
};
