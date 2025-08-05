import { httpErrors } from '@household/api/common/error-handlers';
import { IProductService } from '@household/shared/services/product-service';
import { Product } from '@household/shared/types/types';

export interface IDeleteProductService {
  (ctx: {
    productId: Product.Id;
  }): Promise<unknown>;
}

export const deleteProductServiceFactory = (
  productService: IProductService): IDeleteProductService => {
  return ({ productId }) => {
    return productService.deleteProduct(productId).catch(httpErrors.product.delete({
      productId,
    }));
  };
};
