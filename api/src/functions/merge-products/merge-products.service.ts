import { httpErrors } from '@household/api/common/error-handlers';
import { IProductService } from '@household/shared/services/product-service';
import { Product } from '@household/shared/types/types';

export interface IMergeProductsService {
  (ctx: {
    body: Product.Id[];
  } & Product.ProductId): Promise<unknown>;
}

export const mergeProductsServiceFactory = (
  productService: IProductService,
): IMergeProductsService => {
  return async ({ body, productId }) => {
    httpErrors.product.mergeTargetAmongSource({
      target: productId,
      source: body,
    });

    const productIds = [
      productId,
      ...new Set(body),
    ];

    const products = await productService.listProductsByIds(productIds).catch(httpErrors.product.listByIds(productIds));

    httpErrors.product.multipleNotFound({
      products,
      productIds,
    });

    httpErrors.product.notSameCategory(products);

    return productService.mergeProducts({
      sourceProductIds: body,
      targetProductId: productId,
    }).catch(httpErrors.product.merge({
      sourceProductIds: body,
      targetProductId: productId,
    }));
  };
};
