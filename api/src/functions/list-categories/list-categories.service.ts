import { httpErrors } from '@household/api/common/error-handlers';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { Category } from '@household/shared/types/types';

export interface IListCategoriesService {
  (): Promise<Category.Response[]>;
}

export const listCategoriesServiceFactory = (
  categoryService: ICategoryService,
  categoryDocumentConverter: ICategoryDocumentConverter): IListCategoriesService => {
  return async () => {
    const documents = await categoryService.listCategories().catch(httpErrors.category.list());

    return categoryDocumentConverter.toResponseList(documents);
  };
};
