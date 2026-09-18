import { httpErrors } from '@household/api/common/error-handlers';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProductService } from '@household/shared/services/product-service';
import { Api } from '@household/shared/types/api';
import { Requests } from '@household/shared/types/requests';

export interface IUpdateProductService {
  (ctx: {
    body: Requests.Product;
    productId: Api.Product.Id;
    expiresIn: number;
  }): Promise<unknown>;
}

export const updateProductServiceFactory = (
  productService: IProductService,
  productDocumentConverter: IProductDocumentConverter,
): IUpdateProductService => {
  return async ({ body, productId, expiresIn }) => {
    const queried = await productService.findProductById(productId).catch(httpErrors.product.getById({
      productId,
    }));

    httpErrors.product.notFound({
      product: queried,
      productId,
    });

    const update = productDocumentConverter.update(body, expiresIn);

    return productService.updateProduct(productId, update).catch(httpErrors.product.update({
      productId,
      update,
    }));
  };
};
