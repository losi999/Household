import { testDataFactory } from '@household/shared/common/test-data-factory';
import { addSeconds, getProductId } from '@household/shared/common/utils';
import { productDocumentConverterFactory, IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { Types } from 'mongoose';

describe('Product document converter', () => {
  let converter: IProductDocumentConverter;

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date());

    converter = productDocumentConverterFactory();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const expiresIn = 3600;

  const genericProductDocument = testDataFactory.product.document.generic();
  const specificProductDocument = testDataFactory.product.document.specific({
    genericProduct: genericProductDocument,
  });
  const variantProductDocument = testDataFactory.product.document.variant({
    genericProduct: genericProductDocument,
    specificProduct: specificProductDocument,
  });

  const genericProductResponse = testDataFactory.product.response.generic({
    productId: getProductId(genericProductDocument),
    name: genericProductDocument.name,
    fullName: genericProductDocument.name,
  });
  const specificProductResponse = testDataFactory.product.response.specific({
    response: {
      productId: getProductId(specificProductDocument),
      name: specificProductDocument.name,
      measurement: specificProductDocument.measurement,
      unitOfMeasurement: specificProductDocument.unitOfMeasurement,
    },
    genericProduct: genericProductResponse,
  });
  const variantProductResponse = testDataFactory.product.response.variant({
    response: {
      productId: getProductId(variantProductDocument),
      name: variantProductDocument.name,
    },
    specificProduct: specificProductResponse,
  });

  describe('createGeneric', () => {
    it('should return document', () => {
      const body = testDataFactory.product.request.generic();

      const result = converter.createGeneric({
        body,
      }, undefined);
      expect(result).toEqual(testDataFactory.product.document.generic({
        ...body,
        _id: undefined,
        expiresAt: undefined,
      }));
    });

    it('should return expiring document', () => {
      const body = testDataFactory.product.request.generic();

      const result = converter.createGeneric({
        body,
      }, expiresIn);
      expect(result).toEqual(testDataFactory.product.document.generic({
        ...body,
        _id: undefined,
        expiresAt: addSeconds(expiresIn),
      }));
    });

    it('should return document with generated id', () => {
      const body = testDataFactory.product.request.generic();

      const result = converter.createGeneric({
        body,
      }, undefined, true);
      expect(result).toEqual(testDataFactory.product.document.generic({
        ...body,
        _id: expect.any(Types.ObjectId),
        expiresAt: undefined,
      }));
    });
  });

  describe('createSpecific', () => {
    it('should return document', () => {
      const body = testDataFactory.product.request.specific();

      const { parentProductId, ...restOfBody } = body;

      const result = converter.createSpecific({
        body,
        genericProduct: genericProductDocument,
      }, undefined);
      expect(result).toEqual(testDataFactory.product.document.specific({
        ...restOfBody,
        genericProduct: genericProductDocument,
        _id: undefined,
        expiresAt: undefined,
      }));
    });

    it('should return expiring document', () => {
      const body = testDataFactory.product.request.specific();

      const { parentProductId, ...restOfBody } = body;

      const result = converter.createSpecific({
        body,
        genericProduct: genericProductDocument,
      }, expiresIn);
      expect(result).toEqual(testDataFactory.product.document.specific({
        ...restOfBody,
        genericProduct: genericProductDocument,
        _id: undefined,
        expiresAt: addSeconds(expiresIn),
      }));
    });

    it('should return document with generated id', () => {
      const body = testDataFactory.product.request.specific();

      const { parentProductId, ...restOfBody } = body;

      const result = converter.createSpecific({
        body,
        genericProduct: genericProductDocument,
      }, undefined, true);
      expect(result).toEqual(testDataFactory.product.document.specific({
        ...restOfBody,
        genericProduct: genericProductDocument,
        _id: expect.any(Types.ObjectId),
        expiresAt: undefined,
      }));
    });
  });

  describe('createVariant', () => {
    it('should return document', () => {
      const body = testDataFactory.product.request.variant();

      const { parentProductId, ...restOfBody } = body;

      const result = converter.createVariant({
        body,
        genericProduct: genericProductDocument,
        specificProduct: specificProductDocument,
      }, undefined);
      expect(result).toEqual(testDataFactory.product.document.variant({
        ...restOfBody,
        genericProduct: genericProductDocument,
        specificProduct: specificProductDocument,
        _id: undefined,
        expiresAt: undefined,
      }));
    });

    it('should return expiring document', () => {
      const body = testDataFactory.product.request.variant();

      const { parentProductId, ...restOfBody } = body;

      const result = converter.createVariant({
        body,
        genericProduct: genericProductDocument,
        specificProduct: specificProductDocument,
      }, expiresIn);
      expect(result).toEqual(testDataFactory.product.document.variant({
        ...restOfBody,
        genericProduct: genericProductDocument,
        specificProduct: specificProductDocument,
        _id: undefined,
        expiresAt: addSeconds(expiresIn),
      }));
    });

    it('should return document with generated id', () => {
      const body = testDataFactory.product.request.variant();

      const { parentProductId, ...restOfBody } = body;

      const result = converter.createVariant({
        body,
        genericProduct: genericProductDocument,
        specificProduct: specificProductDocument,
      }, undefined, true);
      expect(result).toEqual(testDataFactory.product.document.variant({
        ...restOfBody,
        genericProduct: genericProductDocument,
        specificProduct: specificProductDocument,
        _id: expect.any(Types.ObjectId),
        expiresAt: undefined,
      }));
    });
  });

  describe('create', () => {
    it('should return generic document', () => {
      const body = testDataFactory.product.request.generic();

      const result = converter.create({
        body,
        genericProduct: undefined,
        specificProduct: undefined,
      }, undefined);
      expect(result).toEqual(testDataFactory.product.document.generic({
        ...body,
        _id: undefined,
        expiresAt: undefined,
      }));
    });

    it('should return specific document', () => {
      const body = testDataFactory.product.request.specific();

      const { parentProductId, ...restOfBody } = body;

      const result = converter.create({
        body,
        genericProduct: genericProductDocument,
        specificProduct: undefined,
      }, undefined);
      expect(result).toEqual(testDataFactory.product.document.specific({
        ...restOfBody,
        genericProduct: genericProductDocument,
        _id: undefined,
        expiresAt: undefined,
      }));
    });

    it('should return variant document', () => {
      const body = testDataFactory.product.request.variant();

      const { parentProductId, ...restOfBody } = body;

      const result = converter.create({
        body,
        genericProduct: genericProductDocument,
        specificProduct: specificProductDocument,
      }, undefined);
      expect(result).toEqual(testDataFactory.product.document.variant({
        ...restOfBody,
        genericProduct: genericProductDocument,
        specificProduct: specificProductDocument,
        _id: undefined,
        expiresAt: undefined,
      }));
    });
  });

  describe('update', () => {
    it('should update to generic product', () => {
      const body = testDataFactory.product.request.generic();

      const result = converter.update({
        body,
        genericProduct: undefined,
        specificProduct: undefined,
      }, expiresIn);
      expect(result).toEqual(testDataFactory.documentUpdate({
        update: {
          $set: {
            ...body,
            expiresAt: addSeconds(expiresIn),
          },
          $unset: {
            genericProduct: true,
            measurement: true,
            specificProduct: true,
            unitOfMeasurement: true,
          },
        },
      }));
    });

    it('should update to specific product', () => {
      const body = testDataFactory.product.request.specific();

      const { parentProductId, ...restOfBody } = body;

      const result = converter.update({
        body,
        genericProduct: genericProductDocument,
        specificProduct: undefined,
      }, expiresIn);
      expect(result).toEqual(testDataFactory.documentUpdate({
        update: {
          $set: {
            ...restOfBody,
            genericProduct: genericProductDocument,
            expiresAt: addSeconds(expiresIn),
          },
          $unset: {
            specificProduct: true,
          },
        },
      }));
    });

    it('should update to variant product', () => {
      const body = testDataFactory.product.request.variant();

      const { parentProductId, ...restOfBody } = body;

      const result = converter.update({
        body,
        genericProduct: genericProductDocument,
        specificProduct: specificProductDocument,
      }, expiresIn);
      expect(result).toEqual(testDataFactory.documentUpdate({
        update: {
          $set: {
            ...restOfBody,
            genericProduct: genericProductDocument,
            specificProduct: specificProductDocument,
            expiresAt: addSeconds(expiresIn),
          },
          $unset: {
            measurement: true,
            unitOfMeasurement: true,
          },
        },
      }));
    });
  });

  describe('toGenericResponse', () => {
    it('should return response', () => {
      const result = converter.toGenericResponse(genericProductDocument);
      expect(result).toEqual(genericProductResponse);
    });
  });

  describe('toSpecificResponse', () => {
    it('should return response', () => {
      const result = converter.toSpecificResponse(specificProductDocument);
      expect(result).toEqual(specificProductResponse);
    });
  });

  describe('toVariantResponse', () => {
    it('should return response', () => {
      const result = converter.toVariantResponse(variantProductDocument);
      expect(result).toEqual(variantProductResponse);
    });
  });

  describe('toResponse', () => {
    it('should return generic response', () => {
      const result = converter.toResponse(genericProductDocument);
      expect(result).toEqual(genericProductResponse);
    });

    it('should return specific response', () => {
      const result = converter.toResponse(specificProductDocument);
      expect(result).toEqual(specificProductResponse);
    });

    it('should return variant response', () => {
      const result = converter.toResponse(variantProductDocument);
      expect(result).toEqual(variantProductResponse);
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const result = converter.toResponseList([
        genericProductDocument,
        specificProductDocument,
        variantProductDocument,
      ]);
      expect(result).toEqual([
        genericProductResponse,
        specificProductResponse,
        variantProductResponse,
      ]);
    });

    it('should return every product directly followed by its children', () => {
      const secondGenericDocument = testDataFactory.product.document.generic({
        name: 'b generic',
      });
      const secondSpecificDocument = testDataFactory.product.document.specific({
        name: 'b specific',
        genericProduct: secondGenericDocument,
      });
      const firstGenericDocument = testDataFactory.product.document.generic({
        name: 'a generic',
      });
      const firstSpecificDocument = testDataFactory.product.document.specific({
        name: 'a specific',
        genericProduct: firstGenericDocument,
      });
      const firstVariantDocument = testDataFactory.product.document.variant({
        name: 'a variant',
        genericProduct: firstGenericDocument,
        specificProduct: firstSpecificDocument,
      });

      const result = converter.toResponseList([
        firstVariantDocument,
        secondSpecificDocument,
        secondGenericDocument,
        firstSpecificDocument,
        firstGenericDocument,
      ]);

      expect(result.map(response => response.productId)).toEqual([
        getProductId(firstGenericDocument),
        getProductId(firstSpecificDocument),
        getProductId(firstVariantDocument),
        getProductId(secondGenericDocument),
        getProductId(secondSpecificDocument),
      ]);
    });
  });

  describe('toReport', () => {
    it('should return report of a generic product', () => {
      expect(converter.toReport(genericProductDocument)).toEqual({
        productId: getProductId(genericProductDocument),
        fullName: genericProductResponse.fullName,
      });
    });

    it('should return report of a specific product', () => {
      expect(converter.toReport(specificProductDocument)).toEqual({
        productId: getProductId(specificProductDocument),
        fullName: specificProductResponse.fullName,
      });
    });

    it('should return report of a variant product', () => {
      expect(converter.toReport(variantProductDocument)).toEqual({
        productId: getProductId(variantProductDocument),
        fullName: variantProductResponse.fullName,
      });
    });

    it('should return undefined if there is no product', () => {
      expect(converter.toReport(undefined)).toBeUndefined();
    });
  });
});
