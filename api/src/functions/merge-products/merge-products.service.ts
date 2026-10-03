import { httpErrors } from '@household/api/common/error-handlers';
import { IProductService } from '@household/shared/services/product-service';
import { Api } from '@household/shared/types/api';

export interface IMergeProductsService {
  (ctx: {
    body: Api.Product.Id[];
  } & Api.Product.ProductId): Promise<unknown>;
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

    httpErrors.product.notSameProductType(products);

    httpErrors.product.notSameParent(products);

    return productService.mergeProducts({
      sourceProductIds: body,
      targetProductId: productId,
      productType: products[0].productType,
    }).catch(httpErrors.product.merge({
      sourceProductIds: body,
      targetProductId: productId,
    }));
  };
};
