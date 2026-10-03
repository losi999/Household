import { httpErrors } from '@household/api/common/error-handlers';
import { IProductService } from '@household/shared/services/product-service';
import { Api } from '@household/shared/types/api';

export interface IDeleteProductService {
  (ctx: Api.Product.ProductId): Promise<unknown>;
}

export const deleteProductServiceFactory = (
  productService: IProductService): IDeleteProductService => {
  return async ({ productId }) => {
    await httpErrors.product.hasChildren(productService.listProductsByParentId(productId).catch(httpErrors.product.listByParentId({
      productId,
    })));  

    return productService.deleteProduct(productId).catch(httpErrors.product.delete({
      productId,
    }));
  };
};
