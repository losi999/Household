import { createProductDocument, createProductRequest, createProductResponse } from '@household/shared/common/test-data-factory';
import { addSeconds, getProductId } from '@household/shared/common/utils';
import { productDocumentConverterFactory, IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { advanceTo, clear } from 'jest-date-mock';

describe('Product document converter', () => {
  let converter: IProductDocumentConverter;
  const now = new Date();

  beforeEach(() => {
    advanceTo(now);
    converter = productDocumentConverterFactory();
  });

  afterEach(() => {
    clear();
  });

  const brand = 'tesco';
  const unitOfMeasurement = 'kg';
  const measurement = 200;
  const expiresIn = 3600;

  const body = createProductRequest({
    unitOfMeasurement,
    brand,
    measurement,
  });
  const queriedDocument = createProductDocument({
    brand,
    unitOfMeasurement,
    measurement,
    createdAt: now,
    updatedAt: now,
  });

  describe('create', () => {
    it('should return document', () => {
      const result = converter.create(body, undefined);
      expect(result).toEqual(createProductDocument({
        unitOfMeasurement,
        brand,
        measurement,
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const result = converter.create(body, expiresIn);
      expect(result).toEqual(createProductDocument({
        unitOfMeasurement,
        brand,
        measurement,
        expiresAt: addSeconds(expiresIn, now),
        _id: undefined,
      }));
    });

  });

  // describe('update', () => {
  //   const { updatedAt, ...document } = queriedDocument;
  //   it('should update document', () => {
  //     const result = converter.update({
  //       body,
  //       document,
  //     }, expiresIn);
  //     expect(result).toEqual(createProductDocument({
  //       _id: document._id,
  //       description,
  //       name,
  //       createdAt: now,
  //       expiresAt: addSeconds(expiresIn, now),
  //     }));
  //   });
  // });

  describe('toResponse', () => {
    it('should return response', () => {
      const result = converter.toResponse(queriedDocument);
      expect(result).toEqual(createProductResponse({
        productId: getProductId(queriedDocument),
        unitOfMeasurement,
        brand,
        measurement,
      }));
    });
  });

  // describe('toResponseList', () => {
  //   it('should return response list', () => {
  //     const result = converter.toResponseList([queriedDocument]);
  //     expect(result).toEqual([
  //       createProductResponse({
  //         productId: getProductId(queriedDocument),
  //         description,
  //         name,
  //       }),
  //     ]);
  //   });
  // });
});
