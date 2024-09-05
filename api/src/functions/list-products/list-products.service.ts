import { httpErrors } from '@household/api/common/error-handlers';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProductService } from '@household/shared/services/product-service';
import { Product } from '@household/shared/types/types';

export interface IListProductsService {
  (): Promise<Product.GroupedResponse[]>;
}

export const listProductsServiceFactory = (
  productService: IProductService,
  productDocumentConverter: IProductDocumentConverter): IListProductsService => {
  return async () => {

    const documents = await productService.listProducts().catch(httpErrors.product.list());

    return productDocumentConverter.toGroupedResponseList(documents);
  };
};
