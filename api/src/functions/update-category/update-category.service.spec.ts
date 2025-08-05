import { IUpdateCategoryService, updateCategoryServiceFactory } from '@household/api/functions/update-category/update-category.service';
import { createCategoryDocument, createCategoryRequest, createDocumentUpdate } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { getCategoryId } from '@household/shared/common/utils';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';

describe('Update category service', () => {
  let service: IUpdateCategoryService;
  let mockCategoryService: Mock<ICategoryService>;
  let mockCategoryDocumentConverter: Mock<ICategoryDocumentConverter>;

  beforeEach(() => {
    mockCategoryService = createMockService('findCategoryById', 'updateCategory');
    mockCategoryDocumentConverter = createMockService('update');

    service = updateCategoryServiceFactory(mockCategoryService.service, mockCategoryDocumentConverter.service);
  });

  const body = createCategoryRequest();
  const queriedDocument = createCategoryDocument();
  const categoryId = getCategoryId(queriedDocument);
  const queriedParentCategory = createCategoryDocument();
  const updateQuery = createDocumentUpdate({
    name: 'updated',
  });

  describe('should return', () => {
    it('if parent is given', async () => {
      const { parentCategoryId, ...cleanedBody } = body;

      mockCategoryService.functions.findCategoryById.mockResolvedValueOnce(queriedDocument);
      mockCategoryService.functions.findCategoryById.mockResolvedValueOnce(queriedParentCategory);
      mockCategoryDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockCategoryService.functions.updateCategory.mockResolvedValue(undefined);

      await service({
        categoryId,
        body,
        expiresIn: undefined,
      });
      validateNthFunctionCall(mockCategoryService.functions.findCategoryById, 1, categoryId);
      validateNthFunctionCall(mockCategoryService.functions.findCategoryById, 2, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.update, {
        body: cleanedBody,
        parentCategory: queriedParentCategory,
      }, undefined);
      validateFunctionCall(mockCategoryService.functions.updateCategory, categoryId, updateQuery);
      expect.assertions(4);
    });

    it('if parent is not given', async () => {
      const modifiedBody = createCategoryRequest({
        parentCategoryId: undefined,
      });
      const { parentCategoryId, ...cleanedBody } = modifiedBody;
      mockCategoryService.functions.findCategoryById.mockResolvedValueOnce(queriedDocument);
      mockCategoryService.functions.findCategoryById.mockResolvedValueOnce(undefined);
      mockCategoryDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockCategoryService.functions.updateCategory.mockResolvedValue(undefined);

      await service({
        categoryId,
        body: modifiedBody,
        expiresIn: undefined,
      });
      validateNthFunctionCall(mockCategoryService.functions.findCategoryById, 1, categoryId);
      validateNthFunctionCall(mockCategoryService.functions.findCategoryById, 2, undefined);
      validateFunctionCall(mockCategoryDocumentConverter.functions.update, {
        body: cleanedBody,
        parentCategory: undefined,
      }, undefined);
      validateFunctionCall(mockCategoryService.functions.updateCategory, categoryId, updateQuery);
      expect.assertions(4);
    });
  });

  describe('should throw error', () => {
    it('if unable to query category', async () => {
      mockCategoryService.functions.findCategoryById.mockRejectedValueOnce('this is a mongo error');
      mockCategoryService.functions.findCategoryById.mockResolvedValueOnce(queriedParentCategory);

      await service({
        categoryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while getting category', 500));
      validateNthFunctionCall(mockCategoryService.functions.findCategoryById, 1, categoryId);
      validateNthFunctionCall(mockCategoryService.functions.findCategoryById, 2, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.update);
      validateFunctionCall(mockCategoryService.functions.updateCategory);
      expect.assertions(6);
    });

    it('if unable to query parent category', async () => {
      mockCategoryService.functions.findCategoryById.mockResolvedValueOnce(queriedDocument);
      mockCategoryService.functions.findCategoryById.mockRejectedValueOnce('this is a mongo error');

      await service({
        categoryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while getting category', 500));
      validateNthFunctionCall(mockCategoryService.functions.findCategoryById, 1, categoryId);
      validateNthFunctionCall(mockCategoryService.functions.findCategoryById, 2, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.update);
      validateFunctionCall(mockCategoryService.functions.updateCategory);
      expect.assertions(6);
    });

    it('no category found', async () => {
      mockCategoryService.functions.findCategoryById.mockResolvedValueOnce(undefined);
      mockCategoryService.functions.findCategoryById.mockResolvedValueOnce(queriedParentCategory);
      await service({
        categoryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('No category found', 404));
      validateNthFunctionCall(mockCategoryService.functions.findCategoryById, 1, categoryId);
      validateNthFunctionCall(mockCategoryService.functions.findCategoryById, 2, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.update);
      validateFunctionCall(mockCategoryService.functions.updateCategory);
      expect.assertions(6);
    });

    it('no parent category found', async () => {
      mockCategoryService.functions.findCategoryById.mockResolvedValueOnce(queriedDocument);
      mockCategoryService.functions.findCategoryById.mockResolvedValueOnce(undefined);

      await service({
        categoryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Parent category not found', 400));
      validateNthFunctionCall(mockCategoryService.functions.findCategoryById, 1, categoryId);
      validateNthFunctionCall(mockCategoryService.functions.findCategoryById, 2, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.update);
      validateFunctionCall(mockCategoryService.functions.updateCategory);
      expect.assertions(6);
    });

    it('unable to save category', async () => {
      const { parentCategoryId, ...cleanedBody } = body;

      mockCategoryService.functions.findCategoryById.mockResolvedValueOnce(queriedDocument);
      mockCategoryService.functions.findCategoryById.mockResolvedValueOnce(queriedParentCategory);
      mockCategoryDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockCategoryService.functions.updateCategory.mockRejectedValue('this is a mongo error');

      await service({
        categoryId,
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while updating category', 500));
      validateNthFunctionCall(mockCategoryService.functions.findCategoryById, 1, categoryId);
      validateNthFunctionCall(mockCategoryService.functions.findCategoryById, 2, body.parentCategoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.update, {
        body: cleanedBody,
        parentCategory: queriedParentCategory,
      }, undefined);
      validateFunctionCall(mockCategoryService.functions.updateCategory, categoryId, updateQuery);
      expect.assertions(6);
    });
  });
});
