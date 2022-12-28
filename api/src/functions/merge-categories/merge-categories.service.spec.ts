import { IMergeCategoriesService, mergeCategoriesServiceFactory } from '@household/api/functions/merge-categories/merge-categories.service';
import { createCategoryDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCategoryId } from '@household/shared/common/utils';
import { ICategoryService } from '@household/shared/services/category-service';

describe('Merge category service', () => {
  let service: IMergeCategoriesService;
  let mockCategoryService: Mock<ICategoryService>;

  beforeEach(() => {
    mockCategoryService = createMockService('listCategoriesByIds', 'mergeCategories');

    service = mergeCategoriesServiceFactory(mockCategoryService.service);
  });

  const targetCategoryDocument = createCategoryDocument();
  const sourceCategoryDocument = createCategoryDocument();
  const sourceCategoryId = getCategoryId(sourceCategoryDocument);
  const categoryId = getCategoryId(targetCategoryDocument);
  const body = [sourceCategoryId];

  it('should return if categories are merged', async () => {
    mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([
      targetCategoryDocument,
      sourceCategoryDocument,
    ]);
    mockCategoryService.functions.mergeCategories.mockResolvedValue(undefined);

    await service({
      body,
      categoryId,
    });
    validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
      categoryId,
      sourceCategoryId,
    ]);
    validateFunctionCall(mockCategoryService.functions.mergeCategories, {
      sourceCategoryIds: body,
      targetCategoryId: categoryId,
    });
    expect.assertions(2);
  });

  describe('should throw error', () => {
    it('if target category is among source categories', async () => {
      await service({
        body: [
          categoryId,
          sourceCategoryId,
        ],
        categoryId,
      }).catch(validateError('Target category is among the source category Ids', 400));
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds);
      validateFunctionCall(mockCategoryService.functions.mergeCategories);
      expect.assertions(4);
    });

    it('if unable to query categories', async () => {
      mockCategoryService.functions.listCategoriesByIds.mockRejectedValue('This is a mongo error');

      await service({
        body,
        categoryId,
      }).catch(validateError('Error while listing categories by ids', 500));
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
        categoryId,
        sourceCategoryId,
      ]);
      validateFunctionCall(mockCategoryService.functions.mergeCategories);
      expect.assertions(4);
    });

    it('if some of the categories not found', async () => {
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([sourceCategoryDocument]);
      mockCategoryService.functions.mergeCategories.mockResolvedValue(undefined);

      await service({
        body,
        categoryId,
      }).catch(validateError('Some of the categories are not found', 400));
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
        categoryId,
        sourceCategoryId,
      ]);
      validateFunctionCall(mockCategoryService.functions.mergeCategories);
      expect.assertions(4);
    });

    it('if unable to merge categories', async () => {
      mockCategoryService.functions.listCategoriesByIds.mockResolvedValue([
        targetCategoryDocument,
        sourceCategoryDocument,
      ]);
      mockCategoryService.functions.mergeCategories.mockRejectedValue('This is a mongo error');

      await service({
        body,
        categoryId,
      }).catch(validateError('Error while merging categories', 500));
      validateFunctionCall(mockCategoryService.functions.listCategoriesByIds, [
        categoryId,
        sourceCategoryId,
      ]);
      validateFunctionCall(mockCategoryService.functions.mergeCategories, {
        sourceCategoryIds: body,
        targetCategoryId: categoryId,
      });
      expect.assertions(4);
    });
  });
});
