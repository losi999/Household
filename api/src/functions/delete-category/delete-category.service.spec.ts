import { IDeleteCategoryService, deleteCategoryServiceFactory } from '@household/api/functions/delete-category/delete-category.service';
import { createCategoryId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICategoryService } from '@household/shared/services/category-service';

describe('Delete category service', () => {
  let service: IDeleteCategoryService;
  let mockCategoryService: Mock<ICategoryService>;
  beforeEach(() => {
    mockCategoryService = createMockService('deleteCategory');

    service = deleteCategoryServiceFactory(mockCategoryService.service);
  });

  const categoryId = createCategoryId();

  it('should return if document is deleted', async () => {
    mockCategoryService.functions.deleteCategory.mockResolvedValue(undefined);

    await service({
      categoryId,
    });
    validateFunctionCall(mockCategoryService.functions.deleteCategory, categoryId);
    expect.assertions(1);
  });

  describe('should throw error', () => {
    it('if unable to delete document', async () => {
      mockCategoryService.functions.deleteCategory.mockRejectedValue('this is a mongo error');

      await service({
        categoryId,
      }).catch(validateError('Error while deleting category', 500));
      validateFunctionCall(mockCategoryService.functions.deleteCategory, categoryId);
      expect.assertions(3);
    });
  });
});
