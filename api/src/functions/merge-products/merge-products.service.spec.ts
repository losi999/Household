import { IMergeProductsService, mergeProductsServiceFactory } from '@household/api/functions/merge-products/merge-products.service';
import { createProductDocument, createCategoryDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCategoryId, getProductId } from '@household/shared/common/utils';
import { ICategoryService } from '@household/shared/services/category-service';
import { IProductService } from '@household/shared/services/product-service';

describe('Merge product service', () => {
  let service: IMergeProductsService;
  let mockProductService: Mock<IProductService>;
  let mockCategoryService: Mock<ICategoryService>;

  beforeEach(() => {
    mockProductService = createMockService('listProductsByIds', 'mergeProducts');
    mockCategoryService = createMockService('getCategoryByProductIds');

    service = mergeProductsServiceFactory(mockProductService.service, mockCategoryService.service);
  });

  const targetProductDocument = createProductDocument();
  const sourceProductDocument = createProductDocument();
  const sourceProductId = getProductId(sourceProductDocument);
  const productId = getProductId(targetProductDocument);
  const body = [sourceProductId];
  const queriedCategoryDocument = createCategoryDocument();

  it('should return if products are merged', async () => {
    mockProductService.functions.listProductsByIds.mockResolvedValue([
      targetProductDocument,
      sourceProductDocument,
    ]);
    mockCategoryService.functions.getCategoryByProductIds.mockResolvedValue(queriedCategoryDocument);
    mockProductService.functions.mergeProducts.mockResolvedValue(undefined);

    await service({
      body,
      productId,
    });
    validateFunctionCall(mockProductService.functions.listProductsByIds, [
      productId,
      sourceProductId,
    ]);
    validateFunctionCall(mockCategoryService.functions.getCategoryByProductIds, [
      productId,
      sourceProductId,
    ]);
    validateFunctionCall(mockProductService.functions.mergeProducts, {
      categoryId: getCategoryId(queriedCategoryDocument),
      sourceProductIds: body,
      targetProductId: productId,
    });
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if target product is among source products', async () => {
      await service({
        body: [
          productId,
          sourceProductId,
        ],
        productId,
      }).catch(validateError('Target product is among the source product Ids', 400));
      validateFunctionCall(mockProductService.functions.listProductsByIds);
      validateFunctionCall(mockCategoryService.functions.getCategoryByProductIds);
      validateFunctionCall(mockProductService.functions.mergeProducts);
      expect.assertions(5);
    });

    it('if unable to query products', async () => {
      mockProductService.functions.listProductsByIds.mockRejectedValue('This is a mongo error');
      mockCategoryService.functions.getCategoryByProductIds.mockResolvedValue(queriedCategoryDocument);

      await service({
        body,
        productId,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockProductService.functions.listProductsByIds, [
        productId,
        sourceProductId,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryByProductIds, [
        productId,
        sourceProductId,
      ]);
      validateFunctionCall(mockProductService.functions.mergeProducts);
      expect.assertions(5);
    });

    it('if unable to query category', async () => {
      mockProductService.functions.listProductsByIds.mockResolvedValue([
        targetProductDocument,
        sourceProductDocument,
      ]);
      mockCategoryService.functions.getCategoryByProductIds.mockRejectedValue('This is a mongo error');

      await service({
        body,
        productId,
      }).catch(validateError('Unable to query related data', 500));
      validateFunctionCall(mockProductService.functions.listProductsByIds, [
        productId,
        sourceProductId,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryByProductIds, [
        productId,
        sourceProductId,
      ]);
      validateFunctionCall(mockProductService.functions.mergeProducts);
      expect.assertions(5);
    });

    it('if some of the products not found', async () => {
      mockProductService.functions.listProductsByIds.mockResolvedValue([sourceProductDocument]);
      mockCategoryService.functions.getCategoryByProductIds.mockResolvedValue(queriedCategoryDocument);
      mockProductService.functions.mergeProducts.mockResolvedValue(undefined);

      await service({
        body,
        productId,
      }).catch(validateError('Some of the products are not found', 400));
      validateFunctionCall(mockProductService.functions.listProductsByIds, [
        productId,
        sourceProductId,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryByProductIds, [
        productId,
        sourceProductId,
      ]);
      validateFunctionCall(mockProductService.functions.mergeProducts);
      expect.assertions(5);
    });

    it('if category not found', async () => {
      mockProductService.functions.listProductsByIds.mockResolvedValue([
        targetProductDocument,
        sourceProductDocument,
      ]);
      mockCategoryService.functions.getCategoryByProductIds.mockResolvedValue(undefined);

      await service({
        body,
        productId,
      }).catch(validateError('No category found', 400));
      validateFunctionCall(mockProductService.functions.listProductsByIds, [
        productId,
        sourceProductId,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryByProductIds, [
        productId,
        sourceProductId,
      ]);
      validateFunctionCall(mockProductService.functions.mergeProducts);
      expect.assertions(5);
    });

    it('if unable to merge products', async () => {
      mockProductService.functions.listProductsByIds.mockResolvedValue([
        targetProductDocument,
        sourceProductDocument,
      ]);
      mockCategoryService.functions.getCategoryByProductIds.mockResolvedValue(queriedCategoryDocument);
      mockProductService.functions.mergeProducts.mockRejectedValue('This is a mongo error');

      await service({
        body,
        productId,
      }).catch(validateError('Error while merging products', 500));
      validateFunctionCall(mockProductService.functions.listProductsByIds, [
        productId,
        sourceProductId,
      ]);
      validateFunctionCall(mockCategoryService.functions.getCategoryByProductIds, [
        productId,
        sourceProductId,
      ]);
      validateFunctionCall(mockProductService.functions.mergeProducts, {
        categoryId: getCategoryId(queriedCategoryDocument),
        sourceProductIds: body,
        targetProductId: productId,
      });
      expect.assertions(5);
    });
  });
});
