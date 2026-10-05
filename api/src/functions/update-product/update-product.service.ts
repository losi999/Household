import { httpErrors } from '@household/api/common/error-handlers';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { ProductType } from '@household/shared/enums';
import { IProductService } from '@household/shared/services/product-service';
import { Api } from '@household/shared/types/api';
import { ExpiresIn } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';

export interface IUpdateProductService {
  (ctx: {
    body: Requests.Product;
  } & Api.Product.ProductId & ExpiresIn): Promise<unknown>;
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

    if (queried.productType !== body.productType) {
      const childProducts = await productService.listProductsByParentId(productId).catch(httpErrors.product.listByParentId({
        productId,
      }));
      
      httpErrors.product.productTypeNotUpdatable(childProducts);  
    }

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

    const update = productDocumentConverter.update({
      body,
      genericProduct: parentProductDocument?.productType === ProductType.Generic ? parentProductDocument : parentProductDocument?.genericProduct,
      specificProduct: parentProductDocument?.productType === ProductType.Specific ? parentProductDocument : undefined,
    }, expiresIn);

    return productService.updateProduct(productId, update).catch(httpErrors.product.update({
      productId,
      update,
    }));
  };
};
