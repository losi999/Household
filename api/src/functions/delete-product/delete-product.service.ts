import { httpErrors } from '@household/api/common/error-handlers';
import { IProductService } from '@household/shared/services/product-service';
import { Api } from '@household/shared/types/api';

export interface IDeleteProductService {
  (ctx: Api.Product.ProductId): Promise<unknown>;
}

export const deleteProductServiceFactory = (
  productService: IProductService): IDeleteProductService => {
  return ({ productId }) => {
    return productService.deleteProduct(productId).catch(httpErrors.product.delete({
      productId,
    }));
  };
};
