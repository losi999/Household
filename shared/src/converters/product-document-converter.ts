import { generateMongoId } from '@household/shared/common/mongoose-utils';
import { addSeconds, getProductId } from '@household/shared/common/utils';
import { DocumentUpdate } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';
import { Documents } from '@household/shared/types/documents';
import { Api } from '@household/shared/types/api';
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
  toResponseTreeList(products: Documents.Product[]): Responses.ProductTree[];
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
        fullName: `${restOfBody.name} ${restOfBody.measurement} ${restOfBody.unitOfMeasurement}`,
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
                fullName: true,
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
                fullName: `${body.name} ${body.measurement} ${body.unitOfMeasurement}`,
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
                fullName: true,
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
        fullName: 'document.fullName', // TODO
      } : undefined;
    },
    toResponseTreeList: (products) => {
      const genericProducts = new Map<Api.Product.Id, Responses.ProductTree>();
      const specificProducts = new Map<Api.Product.Id, Responses.ProductTree['children'][number]>();

      products.forEach((doc) => {
        if (doc.productType === ProductType.Generic) {
          genericProducts.set(getProductId(doc), {
            ...instance.toGenericResponse(doc),
            children: [],
          });

          return;
        }

        if (doc.productType === ProductType.Specific) {
          const { name, productType, fullName, measurement, unitOfMeasurement } = doc;
          const child: Responses.ProductTree['children'][number] = {
            productType,
            name,
            fullName,
            unitOfMeasurement,
            measurement,
            productId: getProductId(doc),    
            children: [],
          };
          
          specificProducts.set(child.productId, child);
          genericProducts.get(getProductId(doc.genericProduct))?.children.push(child);

          return;
        }

        if (doc.productType === ProductType.Variant) {
          const { name, productType } = doc;

          specificProducts.get(getProductId(doc.specificProduct))?.children.push({
            productType,
            name,
            productId: getProductId(doc),    
          });
        }        
      });

      return [...genericProducts.values()];
    },
    toGenericResponse: (doc) => {
      const { name, productType } = doc;
      return {
        productType,
        name,
        productId: getProductId(doc),    
      };
    },
    toSpecificResponse: (doc) => {
      const { name, productType, fullName, genericProduct, measurement, unitOfMeasurement } = doc;
      return {
        productType,
        name,
        fullName,
        unitOfMeasurement,
        measurement,
        genericProduct: instance.toGenericResponse(genericProduct),
        productId: getProductId(doc),    
      };
    },
    toVariantResponse: (doc) => {
      const { name, genericProduct, specificProduct, productType } = doc;
      return {
        productType,
        name,
        genericProduct: instance.toGenericResponse(genericProduct),
        specificProduct: instance.toSpecificResponse(specificProduct),
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
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
