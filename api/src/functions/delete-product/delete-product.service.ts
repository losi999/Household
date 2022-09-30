import { httpErrors } from '@household/api/common/error-handlers';
import { IProductService } from '@household/shared/services/product-service';
import { Product } from '@household/shared/types/types';

export interface IDeleteProductService {
  (ctx: {
    productId: Product.IdType;
  }): Promise<void>;
}

export const deleteProductServiceFactory = (
  productService: IProductService): IDeleteProductService => {
  return async ({ productId }) => {
    await productService.deleteProduct(productId).catch(httpErrors.product.delete({
      productId,
    }));
  };
};
