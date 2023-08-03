import { httpErrors } from '@household/api/common/error-handlers';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { Category } from '@household/shared/types/types';

export interface IUpdateCategoryService {
  (ctx: {
    body: Category.Request;
    expiresIn: number;
  } & Category.CategoryId): Promise<void>;
}

export const updateCategoryServiceFactory = (
  categoryService: ICategoryService,
  categoryDocumentConverter: ICategoryDocumentConverter,
): IUpdateCategoryService => {
  return async ({ body, categoryId, expiresIn }) => {
    const [
      queried,
      parentCategory,
    ] = await Promise.all([
      categoryService.getCategoryById(categoryId),
      categoryService.getCategoryById(body.parentCategoryId),
    ]).catch(httpErrors.category.getById({
      categoryId,
      parentCategoryId: body.parentCategoryId,
    }));

    httpErrors.category.notFound(!queried, {
      categoryId,
    });

    httpErrors.category.parentNotFound(!parentCategory && !!body.parentCategoryId, {
      parentCategoryId: body.parentCategoryId,
    });

    const { updatedAt, ...document } = queried;
    const updated = categoryDocumentConverter.update({
      document,
      body,
      parentCategory,
    }, expiresIn);
    const oldFullName = document.fullName;

    await categoryService.updateCategory(updated, oldFullName).catch(httpErrors.category.update({
      document: updated,
      oldFullName,
    }));
  };
};
