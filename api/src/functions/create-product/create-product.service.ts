import { httpErrors } from '@household/api/common/error-handlers';
import { getProductId } from '@household/shared/common/utils';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { ProductType } from '@household/shared/enums';
import { IProductService } from '@household/shared/services/product-service';
import { Api } from '@household/shared/types/api';
import { ExpiresIn } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';

export interface ICreateProductService {
  (ctx: {
    body: Requests.Product;
  } & ExpiresIn): Promise<Api.Product.Id>;
}

export const createProductServiceFactory = (
  productService: IProductService,
  productDocumentConverter: IProductDocumentConverter): ICreateProductService => {
  return async ({ body, expiresIn }) => {
    let parentProductDocument: Documents.Product;
    if (body.productType !== ProductType.Generic) {
      parentProductDocument = await productService.findProductById(body.parentProductId).catch(httpErrors.product.getById({
        productId: body.parentProductId,
      }));
      
      httpErrors.product.notFound({
        productId: body.parentProductId,
        product: parentProductDocument,
      }, 400);
    }

    httpErrors.product.invalidParentProductType({
      body,
      parent: parentProductDocument,
    });

    const document = productDocumentConverter.create({
      body,
      genericProduct: parentProductDocument?.productType === ProductType.Generic ? parentProductDocument : parentProductDocument?.genericProduct,
      specificProduct: parentProductDocument?.productType === ProductType.Specific ? parentProductDocument : undefined,
    }, expiresIn);

    const saved = await productService.saveProduct(document).catch(httpErrors.product.save(document));

    return getProductId(saved);
  };
};
