import { IListCategoriesService, listCategoriesServiceFactory } from '@household/api/functions/list-categories/list-categories.service';
import { createCategoryDocument, createCategoryResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICategoryDocumentConverter } from '@household/shared/converters/category-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';

describe('List categories service', () => {
  let service: IListCategoriesService;
  let mockCategoryService: Mock<ICategoryService>;
  let mockCategoryDocumentConverter: Mock<ICategoryDocumentConverter>;

  beforeEach(() => {
    mockCategoryService = createMockService('listCategories');
    mockCategoryDocumentConverter = createMockService('toResponseList');

    service = listCategoriesServiceFactory(mockCategoryService.service, mockCategoryDocumentConverter.service);
  });

  const queriedDocument = createCategoryDocument();
  const convertedResponse = createCategoryResponse();
  const categoryType = 'regular';

  it('should return documents', async () => {
    mockCategoryService.functions.listCategories.mockResolvedValue([queriedDocument]);
    mockCategoryDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

    const result = await service({
      categoryType,
    });
    expect(result).toEqual([convertedResponse]);
    validateFunctionCall(mockCategoryService.functions.listCategories, {
      categoryType,
    });
    validateFunctionCall(mockCategoryDocumentConverter.functions.toResponseList, [queriedDocument]);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query categories', async () => {
      mockCategoryService.functions.listCategories.mockRejectedValue('this is a mongo error');

      await service({
        categoryType,
      }).catch(validateError('Error while listing categories', 500));
      validateFunctionCall(mockCategoryService.functions.listCategories, {
        categoryType,
      });
      validateFunctionCall(mockCategoryDocumentConverter.functions.toResponseList);
      expect.assertions(4);
    });
  });
});
