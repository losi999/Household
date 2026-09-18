import { httpErrors } from '@household/api/common/error-handlers';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProductService } from '@household/shared/services/product-service';
import { Responses } from '@household/shared/types/responses';

export interface IListProductsService {
  (): Promise<Responses.ProductGroupedResponse[]>;
}

export const listProductsServiceFactory = (
  productService: IProductService,
  productDocumentConverter: IProductDocumentConverter): IListProductsService => {
  return async () => {

    const documents = await productService.listProducts().catch(httpErrors.product.list());

    return productDocumentConverter.toGroupedResponseList(documents);
  };
};
