import { httpError } from '@household/shared/common/utils';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Category } from '@household/shared/types/types';

export interface IListCategoriesService {
  (): Promise<Category.Response[]>;
}

export const listCategoriesServiceFactory = (
  databaseService: IDatabaseService,
  categoryDocumentConverter: ICategoryDocumentConverter): IListCategoriesService => {
  return async () => {

    const documents = await databaseService.listCategories().catch((error) => {
      console.error('List categories', error);
      throw httpError(500, 'Error while listing categories');
    });

    

    return categoryDocumentConverter.toResponseList(documents);
  };
};
