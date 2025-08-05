import { createCategoryDocument, createCategoryResponse, createDocumentUpdate, createProductDocument, createProductGroupedResponse, createProductReport, createProductRequest, createProductResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock } from '@household/shared/common/unit-testing';
import { addSeconds, getProductId } from '@household/shared/common/utils';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { productDocumentConverterFactory, IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { advanceTo, clear } from 'jest-date-mock';

describe('Product document converter', () => {
  let converter: IProductDocumentConverter;
  let mockCategoryDocumentConverter: Mock<ICategoryDocumentConverter>;
  const now = new Date();

  beforeEach(() => {
    mockCategoryDocumentConverter = createMockService('toResponse');

    advanceTo(now);
    converter = productDocumentConverterFactory(mockCategoryDocumentConverter.service);
  });

  afterEach(() => {
    clear();
  });

  const brand = 'tesco';
  const unitOfMeasurement = 'kg';
  const measurement = 200;
  const expiresIn = 3600;
  const category = createCategoryDocument();
  const body = createProductRequest({
    unitOfMeasurement,
    brand,
    measurement,
  });
  const queriedDocument = createProductDocument({
    brand,
    unitOfMeasurement,
    measurement,
    category,
    createdAt: now,
    updatedAt: now,
  });

  describe('create', () => {
    it('should return document', () => {
      const result = converter.create({
        body,
        category,
      }, undefined);
      expect(result).toEqual(createProductDocument({
        unitOfMeasurement,
        brand,
        measurement,
        category,
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const result = converter.create({
        body,
        category,
      }, expiresIn);
      expect(result).toEqual(createProductDocument({
        unitOfMeasurement,
        brand,
        measurement,
        category,
        expiresAt: addSeconds(expiresIn, now),
        _id: undefined,
      }));
    });

  });

  describe('update', () => {
    it('should update document', () => {
      const result = converter.update(body, expiresIn);
      expect(result).toEqual(createDocumentUpdate({
        $set: {
          ...body,
          fullName: `${body.brand} ${body.measurement} ${body.unitOfMeasurement}`,
          expiresAt: addSeconds(expiresIn, now),
        },
      }));
    });
  });

  describe('toGroupedResponse', () => {
    it('should return response', () => {
      const categoryDocument = createCategoryDocument({
        products: [queriedDocument],
      });

      const categoryResponse = createCategoryResponse({
        fullName: 'category:full:name',
      });

      mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);

      const result = converter.toGroupedResponse(categoryDocument);
      expect(result).toEqual(
        createProductGroupedResponse({
          fullName: categoryResponse.fullName,
          categoryId: categoryResponse.categoryId,
          products: [
            createProductResponse({
              productId: getProductId(queriedDocument),
              unitOfMeasurement,
              brand,
              measurement,
            }),
          ],
        }),
      );
    });
  });

  describe('toGroupedResponseList', () => {
    it('should return response', () => {
      const categoryDocument = createCategoryDocument({
        products: [queriedDocument],
      });

      const categoryResponse = createCategoryResponse({
        fullName: 'category:full:name',
      });

      mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);

      const result = converter.toGroupedResponseList([categoryDocument ]);
      expect(result).toEqual([
        createProductGroupedResponse({
          fullName: categoryResponse.fullName,
          categoryId: categoryResponse.categoryId,
          products: [
            createProductResponse({
              productId: getProductId(queriedDocument),
              unitOfMeasurement,
              brand,
              measurement,
            }),
          ],
        }),
      ]);
    });
  });

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

  describe('toResponseList', () => {
    it('should return response list', () => {
      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        createProductResponse({
          productId: getProductId(queriedDocument),
          unitOfMeasurement,
          brand,
          measurement,
        }),
      ]);
    });
  });

  describe('toReport', () => {
    it('should return response', () => {
      const fullName = 'full name of product 100 g';
      const product = createProductDocument({
        fullName,
      });
      const result = converter.toReport(product);
      expect(result).toEqual(createProductReport({
        productId: getProductId(product),
        fullName,
      }));
    });
  });
});
