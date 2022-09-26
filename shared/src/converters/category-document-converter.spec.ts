import { createCategoryDocument, createCategoryRequest, createCategoryResponse } from '@household/shared/common/test-data-factory';
import { addSeconds, getCategoryId } from '@household/shared/common/utils';
import { categoryDocumentConverterFactory, ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { advanceTo, clear } from 'jest-date-mock';

describe('Category document converter', () => {
  let converter: ICategoryDocumentConverter;
  const now = new Date();

  beforeEach(() => {
    advanceTo(now);
    converter = categoryDocumentConverterFactory();
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
    const { updatedAt, ...document } = queriedDocument;
    it('should update document with parent category', () => {
      const result = converter.update({
        body,
        parentCategory: queriedParentCategory,
        document,
      }, expiresIn);
      expect(result).toEqual(createCategoryDocument({
        _id: document._id,
        name,
        fullName: `${parentCategoryName}:${name}`,
        parentCategory: queriedParentCategory,
        createdAt: now,
        expiresAt: addSeconds(expiresIn, now),
      }));
    });

    it('should update document', () => {
      const result = converter.update({
        body,
        parentCategory: undefined,
        document,
      }, expiresIn);
      expect(result).toEqual(createCategoryDocument({
        _id: document._id,
        name,
        fullName: name,
        createdAt: now,
        expiresAt: addSeconds(expiresIn, now),
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      const result = converter.toResponse(queriedDocument);
      expect(result).toEqual(createCategoryResponse({
        categoryId: getCategoryId(queriedDocument),
        name,
        fullName: name,
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const result = converter.toResponseList([queriedDocument]);
      expect(result).toEqual([
        createCategoryResponse({
          categoryId: getCategoryId(queriedDocument),
          name,
          fullName: name,
        }),
      ]);
    });
  });
});
