import { httpErrors } from '@household/api/common/error-handlers';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { Category } from '@household/shared/types/types';

export interface IListCategoriesService {
  (ctx: Category.CategoryType): Promise<Category.Response[]>;
}

export const listCategoriesServiceFactory = (
  categoryService: ICategoryService,
  categoryDocumentConverter: ICategoryDocumentConverter): IListCategoriesService => {
  return async ({ categoryType }) => {

    const documents = await categoryService.listCategories({
      categoryType,
    }).catch(httpErrors.category.list());

    return categoryDocumentConverter.toResponseList(documents);
  };
};
