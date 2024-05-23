import { createCategoryDocument, createCategoryReport, createCategoryRequest, createCategoryResponse, createDocumentUpdate, createProductDocument, createProductResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock } from '@household/shared/common/unit-testing';
import { addSeconds, getCategoryId } from '@household/shared/common/utils';
import { categoryDocumentConverterFactory, ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { advanceTo, clear } from 'jest-date-mock';

describe('Category document converter', () => {
  let converter: ICategoryDocumentConverter;
  let mockProductDocumentConverter: Mock<IProductDocumentConverter>;
  const now = new Date();

  beforeEach(() => {
    advanceTo(now);
    mockProductDocumentConverter = createMockService('toResponseList');

    converter = categoryDocumentConverterFactory(mockProductDocumentConverter.service);
  });

  afterEach(() => {
    clear();
  });

  const name = 'child';
  const expiresIn = 3600;
  const parentCategoryName = 'parent';
  const body = createCategoryRequest({
    name,
  });
  const queriedDocument = createCategoryDocument({
    name,
    fullName: name,
    createdAt: now,
    updatedAt: now,
  });
  const productResponse = createProductResponse();
  const queriedParentCategory = createCategoryDocument({
    name: parentCategoryName,
    fullName: parentCategoryName,
    createdAt: now,
    updatedAt: now,
  });

  describe('create', () => {
    it('should return document', () => {
      const result = converter.create({
        body,
        parentCategory: undefined,
      }, undefined);
      expect(result).toEqual(createCategoryDocument({
        _id: undefined,
        name,
        fullName: name,
        expiresAt: undefined,
      }));
    });

    it('should return document with parent category', () => {
      const result = converter.create({
        body,
        parentCategory: queriedParentCategory,
      }, undefined);
      expect(result).toEqual(createCategoryDocument({
        _id: undefined,
        name,
        fullName: `${parentCategoryName}:${name}`,
        parentCategory: queriedParentCategory,
        expiresAt: undefined,
      }));
    });

    it('should return expiring document', () => {
      const result = converter.create({
        body,
        parentCategory: undefined,
      }, expiresIn);
      expect(result).toEqual(createCategoryDocument({
        _id: undefined,
        name,
        fullName: name,
        expiresAt: addSeconds(expiresIn, now),
      }));
    });

  });

  describe('update', () => {
    const { parentCategoryId, ...cleanedBody } = body;
    it('should update document with parent category', () => {
      const result = converter.update({
        body: cleanedBody,
        parentCategory: queriedParentCategory,
      }, expiresIn);
      expect(result).toEqual(createDocumentUpdate({
        $set: {
          ...body,
          parentCategoryId: undefined,
          parentCategory: queriedParentCategory,
          fullName: `${parentCategoryName}:${name}`,
          expiresAt: addSeconds(expiresIn, now),
        },
      }));
    });

    it('should update document', () => {
      const result = converter.update({
        body: cleanedBody,
        parentCategory: undefined,
      }, expiresIn);
      expect(result).toEqual(createDocumentUpdate({
        $set: {
          ...body,
          parentCategoryId: undefined,
          fullName: name,
          expiresAt: addSeconds(expiresIn, now),
        },
        $unset: {
          parentCategory: 1,
        },
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      mockProductDocumentConverter.functions.toResponseList.mockReturnValue([productResponse]);

      const result = converter.toResponse({
        ...queriedDocument,
        products: [createProductDocument()],
      });
      expect(result).toEqual(createCategoryResponse({
        categoryId: getCategoryId(queriedDocument),
        name,
        fullName: name,
        products: [productResponse],
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      mockProductDocumentConverter.functions.toResponseList.mockReturnValue([productResponse]);

      const result = converter.toResponseList([
        {
          ...queriedDocument,
          products: [createProductDocument()],
        },
      ]);
      expect(result).toEqual([
        createCategoryResponse({
          categoryId: getCategoryId(queriedDocument),
          name,
          fullName: name,
          products: [productResponse],
        }),
      ]);
    });
  });

  describe('toReport', () => {
    it('should return response', () => {
      const result = converter.toReport(queriedDocument);
      expect(result).toEqual(createCategoryReport({
        categoryId: getCategoryId(queriedDocument),
        fullName: name,
      }));
    });
  });
});
