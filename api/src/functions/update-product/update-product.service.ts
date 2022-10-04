import { httpErrors } from '@household/api/common/error-handlers';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProductService } from '@household/shared/services/product-service';
import { Product } from '@household/shared/types/types';

export interface IUpdateProductService {
  (ctx: {
    body: Product.Request;
    productId: Product.IdType;
    expiresIn: number;
  }): Promise<void>;
}

export const updateProductServiceFactory = (
  productService: IProductService,
  productDocumentConverter: IProductDocumentConverter,
): IUpdateProductService => {
  return async ({ body, productId, expiresIn }) => {
    const queried = await productService.getProductById(productId).catch(httpErrors.product.getById({
      productId,
    }));

    httpErrors.product.notFound(!queried, {
      productId,
    });

    const { updatedAt, ...document } = queried;

    const updated = productDocumentConverter.update({
      document,
      body,
    }, expiresIn);

    await productService.updateProduct(updated).catch(httpErrors.product.update(updated));
  };
};
