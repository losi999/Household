import { ICreateProductService, createProductServiceFactory } from '@household/api/functions/create-product/create-product.service';
import { createProductRequest, createProductDocument, createCategoryDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCategoryId, getProductId } from '@household/shared/common/utils';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';

describe('Create product service', () => {
  let service: ICreateProductService;
  let mockProductService: Mock<IProductService>;
  let mockCategoryService: Mock<ICategoryService>;
  let mockProductDocumentConverter: Mock<IProductDocumentConverter>;

  beforeEach(() => {
    mockProductService = createMockService('saveProduct');
    mockCategoryService = createMockService('getCategoryById');
    mockProductDocumentConverter = createMockService('create');

    service = createProductServiceFactory(mockProductService.service, mockCategoryService.service, mockProductDocumentConverter.service);
  });

  const body = createProductRequest();
  const queriedCategory = createCategoryDocument({
    categoryType: CategoryType.Inventory,
  });
  const categoryId = getCategoryId(queriedCategory);
  const convertedProductDocument = createProductDocument();
  const productId = getProductId(convertedProductDocument);

  it('should return new id', async () => {
    mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
    mockProductDocumentConverter.functions.create.mockReturnValue(convertedProductDocument);
    mockProductService.functions.saveProduct.mockResolvedValue(convertedProductDocument);

    const result = await service({
      body,
      categoryId,
      expiresIn: undefined,
    });
    expect(result).toEqual(productId.toString()),
    validateFunctionCall(mockCategoryService.functions.getCategoryById, categoryId);
    validateFunctionCall(mockProductDocumentConverter.functions.create, {
      body,
      category: queriedCategory,
    }, undefined);
    validateFunctionCall(mockProductService.functions.saveProduct, convertedProductDocument);
    expect.assertions(4);
  });
  describe('should throw error', () => {
    it('if unable to query category', async () => {
      mockCategoryService.functions.getCategoryById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        categoryId,
        expiresIn: undefined,
      }).catch(validateError('Error while getting category', 500));
      validateFunctionCall(mockCategoryService.functions.getCategoryById, categoryId);
      validateFunctionCall(mockProductDocumentConverter.functions.create);
      validateFunctionCall(mockProductService.functions.saveProduct);
      expect.assertions(5);
    });

    it('if no category found', async () => {
      mockCategoryService.functions.getCategoryById.mockResolvedValue(undefined);

      await service({
        body,
        categoryId,
        expiresIn: undefined,
      }).catch(validateError('No category found', 400));
      validateFunctionCall(mockCategoryService.functions.getCategoryById, categoryId);
      validateFunctionCall(mockProductDocumentConverter.functions.create);
      validateFunctionCall(mockProductService.functions.saveProduct);
      expect.assertions(5);
    });

    it('if category is not "inventory" type', async () => {
      mockCategoryService.functions.getCategoryById.mockResolvedValue(createCategoryDocument({
        categoryType: CategoryType.Regular,
      }));
      mockProductDocumentConverter.functions.create.mockReturnValue(convertedProductDocument);
      mockProductService.functions.saveProduct.mockResolvedValue(convertedProductDocument);

      await service({
        body,
        categoryId,
        expiresIn: undefined,
      }).catch(validateError('Category must be "inventory" type', 400));
      validateFunctionCall(mockCategoryService.functions.getCategoryById, categoryId);
      validateFunctionCall(mockProductDocumentConverter.functions.create);
      validateFunctionCall(mockProductService.functions.saveProduct);
      expect.assertions(5);
    });

    it('if unable to save document', async () => {
      mockCategoryService.functions.getCategoryById.mockResolvedValue(queriedCategory);
      mockProductDocumentConverter.functions.create.mockReturnValue(convertedProductDocument);
      mockProductService.functions.saveProduct.mockRejectedValue('this is a mongo error');

      await service({
        body,
        categoryId,
        expiresIn: undefined,
      }).catch(validateError('Error while saving product', 500));
      validateFunctionCall(mockCategoryService.functions.getCategoryById, categoryId);
      validateFunctionCall(mockProductDocumentConverter.functions.create, {
        body,
        category: queriedCategory,
      }, undefined);
      validateFunctionCall(mockProductService.functions.saveProduct, convertedProductDocument);
      expect.assertions(5);
    });
  });
});
