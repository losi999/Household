import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService } from '@household/shared/common/unit-testing';
import { addSeconds, getProductId } from '@household/shared/common/utils';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { productDocumentConverterFactory, IProductDocumentConverter } from '@household/shared/converters/product-document-converter';

describe('Product document converter', () => {
  let converter: IProductDocumentConverter;
  let mockCategoryDocumentConverter: MockService<ICategoryDocumentConverter>;

  beforeEach(() => {
    mockCategoryDocumentConverter = createMockService('toResponse');

    vi.useFakeTimers().setSystemTime(new Date());
    converter = productDocumentConverterFactory(mockCategoryDocumentConverter.service);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const expiresIn = 3600;
  const category = testDataFactory.category.document();

  describe('create', () => {
    it('should return document', () => {
      const body = testDataFactory.product.request();

      const { unitOfMeasurement, brand, measurement } = body;

      const result = converter.create({
        body,
        category,
      }, undefined);
      expect(result).toEqual(testDataFactory.product.document({
        unitOfMeasurement,
        brand,
        measurement,
        category,
        expiresAt: undefined,
        _id: undefined,
      }));
    });

    it('should return expiring document', () => {
      const body = testDataFactory.product.request();

      const { unitOfMeasurement, brand, measurement } = body;

      const result = converter.create({
        body,
        category,
      }, expiresIn);
      expect(result).toEqual(testDataFactory.product.document({
        unitOfMeasurement,
        brand,
        measurement,
        category,
        expiresAt: addSeconds(expiresIn),
        _id: undefined,
      }));
    });

  });

  describe('update', () => {
    it('should update document', () => {
      const body = testDataFactory.product.request();
      
      const result = converter.update(body, expiresIn);
      expect(result).toEqual(testDataFactory.documentUpdate({
        update: {
          $set: {
            ...body,
            fullName: `${body.brand} ${body.measurement} ${body.unitOfMeasurement}`,
            expiresAt: addSeconds(expiresIn),
          },
        },
      }));
    });
  });

  describe('toGroupedResponse', () => {
    it('should return response', () => {
      const doc = testDataFactory.product.document();

      const { unitOfMeasurement, brand, measurement } = doc;

      const categoryDocument = testDataFactory.category.document({
        products: [doc],
      });

      const categoryResponse = testDataFactory.category.response({
        fullName: 'category:full:name',
      });

      mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);

      const result = converter.toGroupedResponse(categoryDocument);
      expect(result).toEqual(
        testDataFactory.product.groupedResponse({
          fullName: categoryResponse.fullName,
          categoryId: categoryResponse.categoryId,
          products: [
            testDataFactory.product.response({
              productId: getProductId(doc),
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
      const doc = testDataFactory.product.document();

      const { unitOfMeasurement, brand, measurement } = doc;

      const categoryDocument = testDataFactory.category.document({
        products: [doc],
      });

      const categoryResponse = testDataFactory.category.response({
        fullName: 'category:full:name',
      });

      mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(categoryResponse);

      const result = converter.toGroupedResponseList([categoryDocument ]);
      expect(result).toEqual([
        testDataFactory.product.groupedResponse({
          fullName: categoryResponse.fullName,
          categoryId: categoryResponse.categoryId,
          products: [
            testDataFactory.product.response({
              productId: getProductId(doc),
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
      const doc = testDataFactory.product.document();

      const { unitOfMeasurement, brand, measurement } = doc;

      const result = converter.toResponse(doc);
      expect(result).toEqual(testDataFactory.product.response({
        productId: getProductId(doc),
        unitOfMeasurement,
        brand,
        measurement,
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const doc = testDataFactory.product.document();

      const { unitOfMeasurement, brand, measurement } = doc;

      const result = converter.toResponseList([doc]);
      expect(result).toEqual([
        testDataFactory.product.response({
          productId: getProductId(doc),
          unitOfMeasurement,
          brand,
          measurement,
        }),
      ]);
    });
  });

  describe('toReport', () => {
    it('should return response', () => {
      const doc = testDataFactory.product.document();

      const { fullName } = doc;

      const result = converter.toReport(doc);
      expect(result).toEqual(testDataFactory.product.report({
        productId: getProductId(doc),
        fullName,
      }));
    });
  });
});
