import { testDataFactory } from '@household/shared/common/test-data-factory';
import { addSeconds, getCategoryId } from '@household/shared/common/utils';
import { categoryDocumentConverterFactory, ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';

describe('Category document converter', () => {
  let converter: ICategoryDocumentConverter;

  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(new Date());

    converter = categoryDocumentConverterFactory();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const expiresIn = 3600;

  const parentCategory = testDataFactory.category.document();

  describe('create', () => {
    it('should return document', () => {
      const body = testDataFactory.category.request();

      const { name, categoryType } = body;

      const result = converter.create({
        body,
        parentCategory: undefined,
      }, undefined);
      expect(result).toEqual(testDataFactory.category.document({
        _id: undefined,
        categoryType,
        name,
        expiresAt: undefined,
      }));
    });

    it('should return document with parent category', () => {
      const body = testDataFactory.category.request();

      const { name, categoryType } = body;

      const result = converter.create({
        body,
        parentCategory,
      }, undefined);
      expect(result).toEqual(testDataFactory.category.document({
        _id: undefined,
        name,
        categoryType,
        ancestors: [parentCategory],
        expiresAt: undefined,
      }));
    });

    it('should return expiring document', () => {
      const body = testDataFactory.category.request();

      const { name, categoryType } = body;

      const result = converter.create({
        body,
        parentCategory: undefined,
      }, expiresIn);
      expect(result).toEqual(testDataFactory.category.document({
        _id: undefined,
        name,
        categoryType,
        expiresAt: addSeconds(expiresIn),
      }));
    });

  });

  describe('update', () => {
    it('should update document with parent category', () => {  
      const body = testDataFactory.category.request();

      const { parentCategoryId, ...cleanedBody } = body;

      const result = converter.update({
        body: cleanedBody,
        parentCategory,
      }, expiresIn);
      expect(result).toEqual(testDataFactory.documentUpdate({
        update: {
          $set: {
            ...cleanedBody,
            ancestors: [
              ...parentCategory.ancestors,
              parentCategory,
            ],
            expiresAt: addSeconds(expiresIn),
          },
        },
      }));
    });

    it('should update document', () => {
      const body = testDataFactory.category.request();

      const { parentCategoryId, ...cleanedBody } = body;

      const result = converter.update({
        body: cleanedBody,
        parentCategory: undefined,
      }, expiresIn);
      expect(result).toEqual(testDataFactory.documentUpdate({
        update: {
          $set: {
            ...cleanedBody,
            ancestors: [],
            expiresAt: addSeconds(expiresIn),
          },
        },
      }));
    });
  });

  describe('toResponse', () => {
    it('should return response', () => {
      const doc = testDataFactory.category.document();

      const { name, categoryType } = doc;

      const result = converter.toResponse(doc);
      expect(result).toEqual(testDataFactory.category.response({
        categoryId: getCategoryId(doc),
        name,
        categoryType,
        fullName: name,
      }));
    });

    it('should return response with parent', () => {
      const doc = testDataFactory.category.document({
        ancestors: [parentCategory],
      });

      const { name, categoryType } = doc;

      const result = converter.toResponse(doc);
      expect(result).toEqual(testDataFactory.category.response({
        categoryId: getCategoryId(doc),
        name,
        categoryType,
        fullName: `${parentCategory.name}:${name}`,
        ancestors: [
          {
            categoryId: getCategoryId(parentCategory),
            name: parentCategory.name,
            categoryType: parentCategory.categoryType,
          },
        ],
        parentCategory: {
          categoryId: getCategoryId(parentCategory),
          name: parentCategory.name,
          categoryType: parentCategory.categoryType,
          fullName: parentCategory.name,
        },
      }));
    });
  });

  describe('toResponseList', () => {
    it('should return response list', () => {
      const doc = testDataFactory.category.document();

      const { name, categoryType } = doc;

      const result = converter.toResponseList([ doc ]);
      expect(result).toEqual([
        testDataFactory.category.response({
          categoryId: getCategoryId(doc),
          name,
          categoryType,
          fullName: name,
        }),
      ]);
    });
  });

  describe('toReport', () => {
    it('should return response', () => {
      const doc = testDataFactory.category.document();

      const { name } = doc;

      const result = converter.toReport(doc);
      expect(result).toEqual(testDataFactory.category.report({
        categoryId: getCategoryId(doc),
        fullName: name,
      }));
    });
  });
});
