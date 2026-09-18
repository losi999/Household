import { httpErrors } from '@household/api/common/error-handlers';
import { ICategoryService } from '@household/shared/services/category-service';
import { Api } from '@household/shared/types/api';

export interface IDeleteCategoryService {
  (ctx: {
    categoryId: Api.Category.Id;
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
