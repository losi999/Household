import { IUpdateCategoryService, updateCategoryServiceFactory } from '@household/api/functions/update-category/update-category.service';
import { createCategoryDocument, createCategoryRequest } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { getCategoryId } from '@household/shared/common/utils';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';

describe('Update category service', () => {
  let service: IUpdateCategoryService;
  let mockCategoryService: Mock<ICategoryService>;
  let mockCategoryDocumentConverter: Mock<ICategoryDocumentConverter>;

  beforeEach(() => {
    mockCategoryService = createMockService('getCategoryById', 'updateCategory');
    mockCategoryDocumentConverter = createMockService('update');

    service = updateCategoryServiceFactory(mockCategoryService.service, mockCategoryDocumentConverter.service);
  });

  const body = createCategoryRequest();
  const queriedDocument = createCategoryDocument();
  const categoryId = getCategoryId(queriedDocument);
  const queriedParentCategory = createCategoryDocument();
  const { updatedAt, ...toUpdate } = queriedDocument;
  const updatedDocument = createCategoryDocument({
    name: 'updated',
  });

  describe('should return', () => {
    it('if parent is given', async () => {
      mockCategoryService.functions.getCategoryById.mockResolvedValueOnce(queriedDocument);
      mockCategoryService.functions.getCategoryById.mockResolvedValueOnce(queriedParentCategory);
      mockCategoryDocumentConverter.functions.update.mockReturnValue(updatedDocument);
      mockCategoryService.functions.updateCategory.mockResolvedValue(undefined);

      await service({
        categoryId,
        body,
        expiresIn: undefined,
      });
      validateNthFunctionCall(mockCategoryService.functions.getCategoryById, 1, categoryId);
      validateNthFunctionCall(mockCategoryService.functions.getCategoryById, 2, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.update, {
        document: toUpdate,
        body,
        parentCategory: queriedParentCategory,
      }, undefined);
      validateFunctionCall(mockCategoryService.functions.updateCategory, updatedDocument, queriedDocument.fullName);
      expect.assertions(4);
    });

    it('if parent is not given', async () => {
      const modifiedBody = createCategoryRequest({
        parentCategoryId: undefined,
      });
      mockCategoryService.functions.getCategoryById.mockResolvedValueOnce(queriedDocument);
      mockCategoryService.functions.getCategoryById.mockResolvedValueOnce(undefined);
      mockCategoryDocumentConverter.functions.update.mockReturnValue(updatedDocument);
      mockCategoryService.functions.updateCategory.mockResolvedValue(undefined);

      await service({
        categoryId,
        body: modifiedBody,
        expiresIn: undefined,
      });
      validateNthFunctionCall(mockCategoryService.functions.getCategoryById, 1, categoryId);
      validateNthFunctionCall(mockCategoryService.functions.getCategoryById, 2, undefined);
      validateFunctionCall(mockCategoryDocumentConverter.functions.update, {
        document: toUpdate,
        body: modifiedBody,
        parentCategory: undefined,
      }, undefined);
      validateFunctionCall(mockCategoryService.functions.updateCategory, updatedDocument, queriedDocument.fullName);
      expect.assertions(4);
    });
  });

  describe('should throw error', () => {
    it('if unable to query category', async () => {
      mockCategoryService.functions.getCategoryById.mockRejectedValueOnce('this is a mongo error');
      mockCategoryService.functions.getCategoryById.mockResolvedValueOnce(queriedParentCategory);

      await service({
        categoryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while getting category', 500));
      validateNthFunctionCall(mockCategoryService.functions.getCategoryById, 1, categoryId);
      validateNthFunctionCall(mockCategoryService.functions.getCategoryById, 2, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.update);
      validateFunctionCall(mockCategoryService.functions.updateCategory);
      expect.assertions(6);
    });

    it('if unable to query parent category', async () => {
      mockCategoryService.functions.getCategoryById.mockResolvedValueOnce(queriedDocument);
      mockCategoryService.functions.getCategoryById.mockRejectedValueOnce('this is a mongo error');

      await service({
        categoryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while getting category', 500));
      validateNthFunctionCall(mockCategoryService.functions.getCategoryById, 1, categoryId);
      validateNthFunctionCall(mockCategoryService.functions.getCategoryById, 2, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.update);
      validateFunctionCall(mockCategoryService.functions.updateCategory);
      expect.assertions(6);
    });

    it('no category found', async () => {
      mockCategoryService.functions.getCategoryById.mockResolvedValueOnce(undefined);
      mockCategoryService.functions.getCategoryById.mockResolvedValueOnce(queriedParentCategory);
      await service({
        categoryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('No category found', 404));
      validateNthFunctionCall(mockCategoryService.functions.getCategoryById, 1, categoryId);
      validateNthFunctionCall(mockCategoryService.functions.getCategoryById, 2, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.update);
      validateFunctionCall(mockCategoryService.functions.updateCategory);
      expect.assertions(6);
    });

    it('no parent category found', async () => {
      mockCategoryService.functions.getCategoryById.mockResolvedValueOnce(queriedDocument);
      mockCategoryService.functions.getCategoryById.mockResolvedValueOnce(undefined);

      await service({
        categoryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Parent category not found', 400));
      validateNthFunctionCall(mockCategoryService.functions.getCategoryById, 1, categoryId);
      validateNthFunctionCall(mockCategoryService.functions.getCategoryById, 2, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.update);
      validateFunctionCall(mockCategoryService.functions.updateCategory);
      expect.assertions(6);
    });

    it('unable to save category', async () => {
      mockCategoryService.functions.getCategoryById.mockResolvedValueOnce(queriedDocument);
      mockCategoryService.functions.getCategoryById.mockResolvedValueOnce(queriedParentCategory);
      mockCategoryDocumentConverter.functions.update.mockReturnValue(updatedDocument);
      mockCategoryService.functions.updateCategory.mockRejectedValue('this is a mongo error');

      await service({
        categoryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while updating category', 500));
      validateNthFunctionCall(mockCategoryService.functions.getCategoryById, 1, categoryId);
      validateNthFunctionCall(mockCategoryService.functions.getCategoryById, 2, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.update, {
        document: toUpdate,
        body,
        parentCategory: queriedParentCategory,
      }, undefined);
      validateFunctionCall(mockCategoryService.functions.updateCategory, updatedDocument, queriedDocument.fullName);
      expect.assertions(6);
    });
  });
});
