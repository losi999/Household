import { ICreateCategoryService, createCategoryServiceFactory } from '@household/api/functions/create-category/create-category.service';
import { createCategoryRequest, createCategoryDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCategoryId } from '@household/shared/common/utils';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';

describe('Create category service', () => {
  let service: ICreateCategoryService;
  let mockCategoryService: Mock<ICategoryService>;
  let mockCategoryDocumentConverter: Mock<ICategoryDocumentConverter>;

  beforeEach(() => {
    mockCategoryService = createMockService('saveCategory', 'findCategoryById');
    mockCategoryDocumentConverter = createMockService('create');

    service = createCategoryServiceFactory(mockCategoryService.service, mockCategoryDocumentConverter.service);
  });

  const body = createCategoryRequest();
  const parentCategory = createCategoryDocument();
  const convertedCategoryDocument = createCategoryDocument();
  const categoryId = getCategoryId(convertedCategoryDocument);

  describe('should return new id', () => {
    it('if parent category is given', async () => {
      mockCategoryService.functions.findCategoryById.mockResolvedValue(parentCategory);
      mockCategoryDocumentConverter.functions.create.mockReturnValue(convertedCategoryDocument);
      mockCategoryService.functions.saveCategory.mockResolvedValue(convertedCategoryDocument);

      const result = await service({
        body,
        expiresIn: undefined,
      });
      expect(result).toEqual(categoryId),
      validateFunctionCall(mockCategoryService.functions.findCategoryById, body.parentCategoryId);
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
      mockCategoryService.functions.findCategoryById.mockResolvedValue(undefined);
      mockCategoryDocumentConverter.functions.create.mockReturnValue(convertedCategoryDocument);
      mockCategoryService.functions.saveCategory.mockResolvedValue(convertedCategoryDocument);

      const result = await service({
        body: parentlessBody,
        expiresIn: undefined,
      });
      expect(result).toEqual(categoryId),
      validateFunctionCall(mockCategoryService.functions.findCategoryById, parentlessBody.parentCategoryId);
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
      mockCategoryService.functions.findCategoryById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while getting category', 500));
      validateFunctionCall(mockCategoryService.functions.findCategoryById, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.create);
      validateFunctionCall(mockCategoryService.functions.saveCategory);
      expect.assertions(5);
    });

    it('if parent category not found', async () => {
      mockCategoryService.functions.findCategoryById.mockResolvedValue(undefined);

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Parent category not found', 400));
      validateFunctionCall(mockCategoryService.functions.findCategoryById, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.create);
      validateFunctionCall(mockCategoryService.functions.saveCategory);
      expect.assertions(5);
    });

    it('if unable to save document', async () => {
      mockCategoryService.functions.findCategoryById.mockResolvedValue(parentCategory);
      mockCategoryDocumentConverter.functions.create.mockReturnValue(convertedCategoryDocument);
      mockCategoryService.functions.saveCategory.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving category', 500));
      validateFunctionCall(mockCategoryService.functions.findCategoryById, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.create, {
        body,
        parentCategory,
      }, undefined);
      validateFunctionCall(mockCategoryService.functions.saveCategory, convertedCategoryDocument);
      expect.assertions(5);
    });
  });
});
