import { httpErrors } from '@household/api/common/error-handlers';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { Category } from '@household/shared/types/types';

export interface IUpdateCategoryService {
  (ctx: {
    body: Category.Request;
    expiresIn: number;
  } & Category.CategoryId): Promise<unknown>;
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
      categoryService.findCategoryById(categoryId),
      categoryService.findCategoryById(parentCategoryId),
    ]).catch(httpErrors.category.getById({
      categoryId,
      parentCategoryId: parentCategoryId,
    }));

    httpErrors.category.notFound({
      category: queried,
      categoryId,
    });

    httpErrors.category.parentNotFound({
      parentCategoryId: parentCategoryId,
      parentCategory,
    });

    httpErrors.category.parentIsAChild(parentCategory, categoryId);

    const update = categoryDocumentConverter.update({
      body,
      parentCategory,
    }, expiresIn);

    return categoryService.updateCategory(categoryId, update).catch(httpErrors.category.update({
      categoryId,
      update,
    }));
  };
};
