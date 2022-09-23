import { httpErrors } from '@household/api/common/error-handlers';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { Category } from '@household/shared/types/types';

export interface ICreateCategoryService {
  (ctx: {
    body: Category.Request;
    expiresIn: number;
  }): Promise<string>;
}

export const createCategoryServiceFactory = (
  categoryService: ICategoryService,
  categoryDocumentConverter: ICategoryDocumentConverter): ICreateCategoryService => {
  return async ({ body, expiresIn }) => {
    const parentCategory = await categoryService.getCategoryById(body.parentCategoryId).catch(httpErrors.category.getById({
      categoryId: body.parentCategoryId,
    }));

    httpErrors.category.parentNotFound(!parentCategory && !!body.parentCategoryId, {
      parentCategoryId: body.parentCategoryId,
    });

    const document = categoryDocumentConverter.create({
      body,
      parentCategory,
    }, expiresIn);

    const saved = await categoryService.saveCategory(document).catch(httpErrors.category.save(document));

    return saved._id.toString();
  };
};
