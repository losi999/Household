import { httpErrors } from '@household/api/common/error-handlers';
import { ICategoryService } from '@household/shared/services/category-service';
import { Category } from '@household/shared/types/types';

export interface IDeleteCategoryService {
  (ctx: {
    categoryId: Category.Id;
  }): Promise<unknown>;
}

export const deleteCategoryServiceFactory = (
  categoryService: ICategoryService): IDeleteCategoryService => {
  return ({ categoryId }) => {
    return categoryService.deleteCategory(categoryId).catch(httpErrors.category.delete({
      categoryId,
    }));
  };
};
