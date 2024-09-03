import { httpErrors } from '@household/api/common/error-handlers';
import { getCategoryId } from '@household/shared/common/utils';
import { ICategoryService } from '@household/shared/services/category-service';
import { Category } from '@household/shared/types/types';

export interface IMergeCategoriesService {
  (ctx: {
    body: Category.Id[];
  } & Category.CategoryId): Promise<void>;
}

export const mergeCategoriesServiceFactory = (
  categoryService: ICategoryService,
): IMergeCategoriesService => {
  return async ({ body, categoryId }) => {
    httpErrors.category.mergeTargetAmongSource({
      categoryId,
      source: body,
    });

    const categoryIds = [
      categoryId,
      ...new Set(body),
    ];

    const categories = await categoryService.listCategoriesByIds(categoryIds).catch(httpErrors.category.listByIds(categoryIds));

    httpErrors.category.multipleNotFound(categories.length !== categoryIds.length, {
      categoryIds,
    });

    httpErrors.category.notSameType(categories);

    const targetCategory = categories.find(c => getCategoryId(c) === categoryId);

    httpErrors.category.mergeSourceIsAnAncestor({
      target: targetCategory,
      source: body,
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
