import { ICreateCategoryService, createCategoryServiceFactory } from '@household/api/functions/create-category/create-category.service';
import { createCategoryRequest, createCategoryDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { Types } from 'mongoose';

describe('Create category service', () => {
  let service: ICreateCategoryService;
  let mockCategoryService: Mock<ICategoryService>;
  let mockCategoryDocumentConverter: Mock<ICategoryDocumentConverter>;

  beforeEach(() => {
    mockCategoryService = createMockService('saveCategory', 'getCategoryById');
    mockCategoryDocumentConverter = createMockService('create');

    service = createCategoryServiceFactory(mockCategoryService.service, mockCategoryDocumentConverter.service);
  });

  const body = createCategoryRequest();
  const categoryId = new Types.ObjectId();
  const parentCategory = createCategoryDocument();
  const convertedCategoryDocument = createCategoryDocument({
    _id: categoryId,
  });

  describe('should return new id', () => {
    it('if parent category is given', async () => {
      mockCategoryService.functions.getCategoryById.mockResolvedValue(parentCategory);
      mockCategoryDocumentConverter.functions.create.mockReturnValue(convertedCategoryDocument);
      mockCategoryService.functions.saveCategory.mockResolvedValue(convertedCategoryDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(categoryId.toString()),
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.create, {
        body,
        parentCategory,
      }, undefined);
      validateFunctionCall(mockCategoryService.functions.saveCategory, convertedCategoryDocument);
      expect.assertions(4);
    });

    it('if parent category is NOT given', async () => {
      const parentlessBody = createCategoryRequest({
        parentCategoryId: undefined,
      });
      mockCategoryService.functions.getCategoryById.mockResolvedValue(undefined);
      mockCategoryDocumentConverter.functions.create.mockReturnValue(convertedCategoryDocument);
      mockCategoryService.functions.saveCategory.mockResolvedValue(convertedCategoryDocument);

      const result = await service({
        body: parentlessBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(categoryId.toString()),
      validateFunctionCall(mockCategoryService.functions.getCategoryById, parentlessBody.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.create, {
        body: parentlessBody,
        parentCategory: undefined,
      }, undefined);
      validateFunctionCall(mockCategoryService.functions.saveCategory, convertedCategoryDocument);
      expect.assertions(4);
    });
  });

  describe('should throw error', () => {
    it('if unable to query parent category', async () => {
      mockCategoryService.functions.getCategoryById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while getting category', 500));
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.create);
      validateFunctionCall(mockCategoryService.functions.saveCategory);
      expect.assertions(5);
    });

    it('if parent category not found', async () => {
      mockCategoryService.functions.getCategoryById.mockResolvedValue(undefined);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Parent category not found', 400));
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.create);
      validateFunctionCall(mockCategoryService.functions.saveCategory);
      expect.assertions(5);
    });

    it('if unable to save document', async () => {
      mockCategoryService.functions.getCategoryById.mockResolvedValue(parentCategory);
      mockCategoryDocumentConverter.functions.create.mockReturnValue(convertedCategoryDocument);
      mockCategoryService.functions.saveCategory.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving category', 500));
      validateFunctionCall(mockCategoryService.functions.getCategoryById, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.create, {
        body,
        parentCategory,
      }, undefined);
      validateFunctionCall(mockCategoryService.functions.saveCategory, convertedCategoryDocument);
      expect.assertions(5);
    });
  });
});
