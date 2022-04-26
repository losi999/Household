import { IGetCategoryService, getCategoryServiceFactory } from '@household/api/functions/get-category/get-category.service';
import { createCategoryId, createCategoryDocument, createCategoryResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
describe('Get category service', () => {
  let service: IGetCategoryService;
  let mockCategoryService: Mock<ICategoryService>;
  let mockCategoryDocumentConverter: Mock<ICategoryDocumentConverter>;

  beforeEach(() => {
    mockCategoryService = createMockService('getCategoryById');
    mockCategoryDocumentConverter = createMockService('toResponse');

    service = getCategoryServiceFactory(mockCategoryService.service, mockCategoryDocumentConverter.service);
  });

  const categoryId = createCategoryId();
  const queriedDocument = createCategoryDocument();
  const convertedResponse = createCategoryResponse();

  it('should return category', async () => {
    mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedDocument);
    mockCategoryDocumentConverter.functions.toResponse.mockReturnValue(convertedResponse);

    const result = await service({
      categoryId,
    });
    expect(result).toEqual(convertedResponse);
    validateFunctionCall(mockCategoryService.functions.getCategoryById, categoryId);
    validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse, queriedDocument);
    expect.assertions(3);
  });
  describe('should throw error', () => {
    it('if unable to query category', async () => {
      mockCategoryService.functions.getCategoryById.mockRejectedValue('this is a mongo error');

      await service({
        categoryId,
      }).catch(validateError('Error while getting category', 500));
      validateFunctionCall(mockCategoryService.functions.getCategoryById, categoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });

    it('if no category found', async () => {
      mockCategoryService.functions.getCategoryById.mockResolvedValue(undefined);

      await service({
        categoryId,
      }).catch(validateError('No category found', 404));
      validateFunctionCall(mockCategoryService.functions.getCategoryById, categoryId);
      validateFunctionCall(mockCategoryDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });
  });
});
