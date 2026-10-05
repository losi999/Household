import { Requests } from '@household/shared/types/requests';
import { Documents } from '@household/shared/types/documents';
import { productDocumentConverter } from '@household/shared/dependencies/converters/product-document-converter';
import { testDataFactory } from '@household/shared/common/test-data-factory';

export const productDataFactory = (() => {
  const createGenericProductDocument = (ctx?: {body?: Partial<Requests.GenericProduct>}): Documents.GenericProduct => {

    return productDocumentConverter.createGeneric({
      body: testDataFactory.product.request.generic(ctx?.body),
    }, Number(process.env.EXPIRES_IN), true);
  };

  const createSpecificProductDocument = (ctx: {
    body?: Partial<Requests.SpecificProduct>;
    genericProduct: Documents.GenericProduct;
  }): Documents.SpecificProduct => {

    return productDocumentConverter.createSpecific({
      body: testDataFactory.product.request.specific(ctx.body),
      genericProduct: ctx.genericProduct,
    }, Number(process.env.EXPIRES_IN), true);
  };

  const createVariantProductDocument = (ctx: {
    body?: Partial<Requests.VariantProduct>;
    genericProduct: Documents.GenericProduct;
    specificProduct: Documents.SpecificProduct;
  }): Documents.VariantProduct => {

    return productDocumentConverter.createVariant({
      body: testDataFactory.product.request.variant(ctx?.body),
      genericProduct: ctx.genericProduct,
      specificProduct: ctx.specificProduct,
    }, Number(process.env.EXPIRES_IN), true);
  };

  return {
    request: testDataFactory.product.request,
    document: {
      generic: createGenericProductDocument,
      specific: createSpecificProductDocument,
      variant: createVariantProductDocument,
    },
    id: testDataFactory.product.id,
  };
})();
