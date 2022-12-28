import { httpErrors } from '@household/api/common/error-handlers';
import { ICategoryService } from '@household/shared/services/category-service';
import { Category } from '@household/shared/types/types';

export interface IMergeCategoriesService {
  (ctx: {
    body: Category.IdType[];
  } & Category.Id): Promise<void>;
}

export const mergeCategoriesServiceFactory = (
  categoryService: ICategoryService,
): IMergeCategoriesService => {
  return async ({ body, categoryId }) => {
    httpErrors.category.mergeTargetAmongSource(body.includes(categoryId), {
      categoryId,
      source: body,
    });

    const categoryIds = [
      categoryId,
      ...new Set(body),
    ];

    const categorys = await categoryService.listCategoriesByIds(categoryIds).catch(httpErrors.category.listByIds(categoryIds));

    httpErrors.category.multipleNotFound(categorys.length !== categoryIds.length, {
      categoryIds,
    });

    await categoryService.mergeCategories({
      sourceCategoryIds: body,
      targetCategoryId: categoryId,
    }).catch(httpErrors.category.merge({
      sourceCategoryIds: body,
      targetCategoryId: categoryId,
    }));
  };
};
