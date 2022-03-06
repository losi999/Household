import { httpError } from '@household/shared/common/utils';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Category } from '@household/shared/types/types';

export interface IDeleteCategoryService {
  (ctx: {
    categoryId: Category.IdType;
  }): Promise<void>;
}

export const deleteCategoryServiceFactory = (
  databaseService: IDatabaseService): IDeleteCategoryService => {
  return async ({ categoryId }) => {
    await databaseService.deleteCategory(categoryId).catch((error) => {
      console.error('Delete category', error);
      throw httpError(500, 'Error while deleting category');
    });
  };
};
