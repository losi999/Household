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
  });
  const specificProductResponse = testDataFactory.product.response.specific({
    productId: getProductId(specificProductDocument),
    name: specificProductDocument.name,
    measurement: specificProductDocument.measurement,
    unitOfMeasurement: specificProductDocument.unitOfMeasurement,
    fullName: specificProductDocument.fullName,
    genericProduct: genericProductResponse,
  });
  const variantProductResponse = testDataFactory.product.response.variant({
    productId: getProductId(variantProductDocument),
    name: variantProductDocument.name,
    genericProduct: genericProductResponse,
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
        fullName: `${body.name} ${body.measurement} ${body.unitOfMeasurement}`,
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
        fullName: `${body.name} ${body.measurement} ${body.unitOfMeasurement}`,
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
        fullName: `${body.name} ${body.measurement} ${body.unitOfMeasurement}`,
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
        fullName: `${body.name} ${body.measurement} ${body.unitOfMeasurement}`,
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
            fullName: true,
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
            fullName: `${body.name} ${body.measurement} ${body.unitOfMeasurement}`,
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
            fullName: true,
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
  });

  describe('toGroupedResponseList', () => {
    it('should return generic products with their descendants nested', () => {
      const result = converter.toGroupedResponseList([
        genericProductDocument,
        specificProductDocument,
        variantProductDocument,
      ]);
      expect(result).toEqual([
        testDataFactory.product.groupedResponse({
          productId: getProductId(genericProductDocument),
          name: genericProductDocument.name,
          children: [
            {
              productId: getProductId(specificProductDocument),
              productType: specificProductDocument.productType,
              name: specificProductDocument.name,
              fullName: specificProductDocument.fullName,
              measurement: specificProductDocument.measurement,
              unitOfMeasurement: specificProductDocument.unitOfMeasurement,
              children: [
                {
                  productId: getProductId(variantProductDocument),
                  productType: variantProductDocument.productType,
                  name: variantProductDocument.name,
                },
              ],
            },
          ],
        }),
      ]);
    });

    it('should omit products whose parent is not among the documents', () => {
      const result = converter.toGroupedResponseList([
        specificProductDocument,
        variantProductDocument,
      ]);
      expect(result).toEqual([]);
    });
  });

  describe('toReport', () => {
    // The converter still hardcodes `fullName: 'document.fullName'` (marked TODO in
    // product-document-converter.ts): `fullName` only exists on specific products, so what it
    // should resolve to for generic and variant products is still undecided.
    it.todo('should return report');
  });
});
