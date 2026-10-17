import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { addSeconds, getProductId, getSpecificProductFullName, getVariantProductFullName, sortProductsByFullName } from '@household/shared/common/utils';
import { DocumentUpdate } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Documents } from '@household/shared/types/documents';
import { ProductType } from '@household/shared/enums';

export interface IProductDocumentConverter {
  create(params: {
    body: Requests.Product;
    genericProduct: Documents.GenericProduct;
    specificProduct: Documents.SpecificProduct;
  }, expiresIn: number, generateId?: boolean): Documents.Product;
  createGeneric(params: {
    body: Requests.GenericProduct;
  }, expiresIn: number, generateId?: boolean): Documents.GenericProduct;
  createSpecific(params: {
    body: Requests.SpecificProduct;
    genericProduct: Documents.GenericProduct;
  }, expiresIn: number, generateId?: boolean): Documents.SpecificProduct;
  createVariant(params: {
    body: Requests.VariantProduct;
    genericProduct: Documents.GenericProduct;
    specificProduct: Documents.SpecificProduct;
  }, expiresIn: number, generateId?: boolean): Documents.VariantProduct;
  update(params: {
    body: Requests.Product;
    genericProduct: Documents.GenericProduct;
    specificProduct: Documents.SpecificProduct;
  }, expiresIn: number): DocumentUpdate<Documents.Product>;
  toGenericResponse(document: Documents.GenericProduct): Responses.GenericProduct;
  toSpecificResponse(document: Documents.SpecificProduct): Responses.SpecificProduct;
  toVariantResponse(document: Documents.VariantProduct): Responses.VariantProduct;
  toResponse(document: Documents.Product): Responses.Product;
  toReport(document: Documents.Product): Responses.ProductReport;
  toResponseList(documents: Documents.Product[]): Responses.Product[];
}

export const productDocumentConverterFactory = (): IProductDocumentConverter => {
  const instance: IProductDocumentConverter = {
    createGeneric: ({ body }, expiresIn, generateId) => {
      return {
        ...body,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    createSpecific: ({ body, genericProduct }, expiresIn, generateId) => {
      const { parentProductId, ...restOfBody } = body;
      return {
        ...restOfBody,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
        genericProduct,
      };
      
    },
    createVariant: ({ body, specificProduct, genericProduct }, expiresIn, generateId) => {
      const { parentProductId, ...restOfBody } = body;
      return {
        ...restOfBody,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
        genericProduct,
        specificProduct,
      };
    },
    create: ({ body, specificProduct, genericProduct }, expiresIn, generateId) => {
      switch(body.productType) {
        case ProductType.Generic: {
          return instance.createGeneric({
            body,
          }, expiresIn, generateId);
        }
        case ProductType.Specific: {
          return instance.createSpecific({
            body,
            genericProduct,
          }, expiresIn, generateId);
        }
        case ProductType.Variant: {
          return instance.createVariant({
            body,
            genericProduct,
            specificProduct,
          }, expiresIn, generateId);
        }
      }
    },
    update: ({ body, genericProduct, specificProduct }, expiresIn) => {
      switch(body.productType) {
        case ProductType.Generic: {
          return {
            update: {
              $set: {
                ...body,
                expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
              },
              $unset: {
                genericProduct: true,
                measurement: true,
                specificProduct: true,
                unitOfMeasurement: true,

              },
            },
          };
        }
        case ProductType.Specific: {
          const { parentProductId, ...restOfBody } = body;
          return {
            update: {
              $set: {
                ...restOfBody,
                genericProduct,
                expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
              },
              $unset: {
                specificProduct: true,
              },
            },
          };
        }
        case ProductType.Variant: {
          const { parentProductId, ...restOfBody } = body;
          return {
            update: {
              $set: {
                ...restOfBody,
                genericProduct,
                specificProduct,
                expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
              },
              $unset: {
                measurement: true,
                unitOfMeasurement: true,
              },
            },
          };
        }
      }
    },
    toReport: (document) => {
      return document ? {
        productId: getProductId(document),
        fullName: instance.toResponse(document).fullName,
      } : undefined;
    },
    toGenericResponse: (doc) => {
      const { name, productType } = doc;
      return {
        productType,
        name,
        fullName: name,
        productId: getProductId(doc),    
      };
    },
    // The parents of the product are expected to be loaded, the full name is built from their names
    toSpecificResponse: (doc) => {
      const { name, productType, genericProduct, measurement, unitOfMeasurement } = doc;

      return {
        productType,
        name,
        fullName: getSpecificProductFullName(genericProduct.name, doc),
        unitOfMeasurement,
        measurement,
        genericProductId: getProductId(genericProduct),
        productId: getProductId(doc),    
      };
    },
    toVariantResponse: (doc) => {
      const { name, genericProduct, specificProduct, productType } = doc;

      return {
        productType,
        name,
        fullName: getVariantProductFullName(getSpecificProductFullName(genericProduct.name, specificProduct), name),
        genericProductId: getProductId(genericProduct),
        specificProductId: getProductId(specificProduct),
        productId: getProductId(doc),    
      };
    },
    toResponse: (doc) => {
      switch (doc.productType) {
        case ProductType.Generic: {
          return instance.toGenericResponse(doc);
        }
        case ProductType.Specific: {
          return instance.toSpecificResponse(doc);          
        }
        case ProductType.Variant: {
          return instance.toVariantResponse(doc);
        }
      }
    },
    // The list is ordered by the full name, so every product is followed by its children
    toResponseList: docs => sortProductsByFullName(docs.map(doc => instance.toResponse(doc))),
  };

  return instance;
};
