import { httpError } from '@household/shared/common/utils';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IDatabaseService } from '@household/shared/services/database-service';
import { Category } from '@household/shared/types/types';

export interface ICreateCategoryService {
  (ctx: {
    body: Category.Request;
    expiresIn: number;
  }): Promise<string>;
}

export const createCategoryServiceFactory = (
  databaseService: IDatabaseService,
  categoryDocumentConverter: ICategoryDocumentConverter): ICreateCategoryService => {
  return async ({ body, expiresIn }) => {
    const parentCategory = await databaseService.getCategoryById(body.parentCategoryId).catch((error) => {
      console.error('Get category', error);
      throw httpError(500, 'Error while getting category');
    });

    if (!parentCategory && body.parentCategoryId) {
      console.error('Parent category not found', body.parentCategoryId);
      throw httpError(400, 'Parent category not found');
    }

    const document = categoryDocumentConverter.create({ body, parentCategory }, expiresIn);

    const saved = await databaseService.saveCategory(document).catch((error) => {
      console.error('Save category', error);
      throw httpError(500, 'Error while saving category');
    });

    return saved._id.toString();
  };
};
