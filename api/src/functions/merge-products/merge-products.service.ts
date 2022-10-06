import { httpErrors } from '@household/api/common/error-handlers';
import { getCategoryId } from '@household/shared/common/utils';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { Product } from '@household/shared/types/types';

export interface IMergeProductsService {
  (ctx: {
    body: Product.IdType[];
  } & Product.Id): Promise<void>;
}

export const mergeProductsServiceFactory = (
  productService: IProductService,
  categoryService: ICategoryService,
): IMergeProductsService => {
  return async ({ body, productId }) => {
    httpErrors.product.mergeTargetAmongSource(body.includes(productId), {
      productId,
      source: body,
    });

    const productIds = [
      productId,
      ...new Set(body),
    ];

    const[
      products,
      category,
    ] = await Promise.all([
      productService.listProductsByIds(productIds),
      categoryService.getCategoryByProductIds(productIds),
    ]).catch(httpErrors.common.getRelatedData(productIds));

    httpErrors.product.multipleNotFound(products.length !== productIds.length, {
      productIds,
    });

    httpErrors.category.notFound(!category, {
      productIds,
    }, 400);

    await productService.mergeProducts({
      categoryId: getCategoryId(category),
      sourceProductIds: body,
      targetProductId: productId,
    }).catch(httpErrors.product.merge({
      categoryId: getCategoryId(category),
      sourceProductIds: body,
      targetProductId: productId,
    }));
  };
};
