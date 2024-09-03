import { httpErrors } from '@household/api/common/error-handlers';
import { getCategoryId } from '@household/shared/common/utils';
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
  return async ({ body: { parentCategoryId, ...body }, categoryId, expiresIn }) => {
    const [
      queried,
      parentCategory,
    ] = await Promise.all([
      categoryService.getCategoryById(categoryId),
      categoryService.getCategoryById(parentCategoryId),
    ]).catch(httpErrors.category.getById({
      categoryId,
      parentCategoryId: parentCategoryId,
    }));

    httpErrors.category.notFound(!queried, {
      categoryId,
    });

    httpErrors.category.parentNotFound(!parentCategory && !!parentCategoryId, {
      parentCategoryId: parentCategoryId,
    });

    httpErrors.category.parentIsAChild(parentCategory, categoryId);

    const update = categoryDocumentConverter.update({
      body,
      parentCategory,
    }, expiresIn);

    await categoryService.updateCategory(categoryId, update).catch(httpErrors.category.update({
      categoryId,
      update,
    }));
  };
};
