import { ICreateProductService, createProductServiceFactory } from '@household/api/functions/create-product/create-product.service';
import { createProductRequest, createProductDocument, createCategoryId, createCategoryDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';
import { Types } from 'mongoose';

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
  const categoryId = createCategoryId();
  const productId = new Types.ObjectId();
  const queriedCategory = createCategoryDocument();
  const convertedProductDocument = createProductDocument({
    _id: productId,
  });

  it('should return new id', async () => {
    mockProductDocumentConverter.functions.create.mockReturnValue(convertedProductDocument);
    mockProductService.functions.saveProduct.mockResolvedValue(convertedProductDocument);

    const result = await service({
      body,
      categoryId,
      expiresIn: undefined,
    });
    expect(result).toEqual(productId.toString()),
    validateFunctionCall(mockProductDocumentConverter.functions.create, {
      body,
      category: queriedCategory,
    }, undefined);
    validateFunctionCall(mockProductService.functions.saveProduct, convertedProductDocument);
    expect.assertions(3);
  });
  describe('should throw error', () => {
    it('if unable to save document', async () => {
      mockProductDocumentConverter.functions.create.mockReturnValue(convertedProductDocument);
      mockProductService.functions.saveProduct.mockRejectedValue('this is a mongo error');

      await service({
        body,
        categoryId,
        expiresIn: undefined,
      }).catch(validateError('Error while saving product', 500));
      validateFunctionCall(mockProductDocumentConverter.functions.create, {
        body,
        category: queriedCategory,
      }, undefined);
      validateFunctionCall(mockProductService.functions.saveProduct, convertedProductDocument);
      expect.assertions(4);
    });
  });
});
