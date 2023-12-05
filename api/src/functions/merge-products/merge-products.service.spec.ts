import { IMergeProductsService, mergeProductsServiceFactory } from '@household/api/functions/merge-products/merge-products.service';
import { createCategoryDocument, createProductDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getProductId } from '@household/shared/common/utils';
import { IProductService } from '@household/shared/services/product-service';

describe('Merge product service', () => {
  let service: IMergeProductsService;
  let mockProductService: Mock<IProductService>;

  beforeEach(() => {
    mockProductService = createMockService('listProductsByIds', 'mergeProducts');

    service = mergeProductsServiceFactory(mockProductService.service);
  });

  const categoryDocument = createCategoryDocument();
  const targetProductDocument = createProductDocument({
    category: categoryDocument,
  });
  const sourceProductDocument = createProductDocument({
    category: categoryDocument,
  });
  const sourceProductId = getProductId(sourceProductDocument);
  const productId = getProductId(targetProductDocument);
  const body = [sourceProductId];

  it('should return if products are merged', async () => {
    mockProductService.functions.listProductsByIds.mockResolvedValue([
      targetProductDocument,
      sourceProductDocument,
    ]);
    mockProductService.functions.mergeProducts.mockResolvedValue(undefined);

    await service({
      body,
      productId,
    });
    validateFunctionCall(mockProductService.functions.listProductsByIds, [
      productId,
      sourceProductId,
    ]);
    validateFunctionCall(mockProductService.functions.mergeProducts, {
      sourceProductIds: body,
      targetProductId: productId,
    });
    expect.assertions(2);
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
      validateFunctionCall(mockProductService.functions.mergeProducts);
      expect.assertions(4);
    });

    it('if unable to query products', async () => {
      mockProductService.functions.listProductsByIds.mockRejectedValue('This is a mongo error');

      await service({
        body,
        productId,
      }).catch(validateError('Error while listing products by ids', 500));
      validateFunctionCall(mockProductService.functions.listProductsByIds, [
        productId,
        sourceProductId,
      ]);
      validateFunctionCall(mockProductService.functions.mergeProducts);
      expect.assertions(4);
    });

    it('if some of the products not found', async () => {
      mockProductService.functions.listProductsByIds.mockResolvedValue([sourceProductDocument]);
      mockProductService.functions.mergeProducts.mockResolvedValue(undefined);

      await service({
        body,
        productId,
      }).catch(validateError('Some of the products are not found', 400));
      validateFunctionCall(mockProductService.functions.listProductsByIds, [
        productId,
        sourceProductId,
      ]);
      validateFunctionCall(mockProductService.functions.mergeProducts);
      expect.assertions(4);
    });

    it('if products belong to different categories', async () => {
      const differentCategoryProductdocument = createProductDocument({
        category: createCategoryDocument(),
      });
      mockProductService.functions.listProductsByIds.mockResolvedValue([
        targetProductDocument,
        sourceProductDocument,
        differentCategoryProductdocument,
      ]);

      await service({
        body: [
          ...body,
          getProductId(differentCategoryProductdocument),
        ],
        productId,
      }).catch(validateError('Not all products belong to the same category', 400));
      validateFunctionCall(mockProductService.functions.listProductsByIds, [
        productId,
        sourceProductId,
        getProductId(differentCategoryProductdocument),
      ]);
      validateFunctionCall(mockProductService.functions.mergeProducts);
      expect.assertions(4);
    });

    it('if unable to merge products', async () => {
      mockProductService.functions.listProductsByIds.mockResolvedValue([
        targetProductDocument,
        sourceProductDocument,
      ]);
      mockProductService.functions.mergeProducts.mockRejectedValue('This is a mongo error');

      await service({
        body,
        productId,
      }).catch(validateError('Error while merging products', 500));
      validateFunctionCall(mockProductService.functions.listProductsByIds, [
        productId,
        sourceProductId,
      ]);
      validateFunctionCall(mockProductService.functions.mergeProducts, {
        sourceProductIds: body,
        targetProductId: productId,
      });
      expect.assertions(4);
    });
  });
});
