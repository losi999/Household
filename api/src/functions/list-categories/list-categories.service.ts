import { httpErrors } from '@household/api/common/error-handlers';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { Responses } from '@household/shared/types/responses';

export interface IListCategoriesService {
  (): Promise<Responses.Category[]>;
}

export const listCategoriesServiceFactory = (
  categoryService: ICategoryService,
  categoryDocumentConverter: ICategoryDocumentConverter): IListCategoriesService => {
  return async () => {
    const documents = await categoryService.listCategories().catch(httpErrors.category.list());

    return categoryDocumentConverter.toResponseList(documents);
  };
};
