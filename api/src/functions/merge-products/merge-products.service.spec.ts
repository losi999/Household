import { IMergeProductsService, mergeProductsServiceFactory } from '@household/api/functions/merge-products/merge-products.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getProductId } from '@household/shared/common/utils';
import { ProductType } from '@household/shared/enums';
import { IProductService } from '@household/shared/services/product-service';

describe('Merge product service', () => {
  let service: IMergeProductsService;
  let mockProductService: MockService<IProductService>;

  beforeEach(() => {
    mockProductService = createMockService('listProductsByIds', 'mergeProducts');

    service = mergeProductsServiceFactory(mockProductService.service);
  });

  const targetProductDocument = testDataFactory.product.document.generic();
  const sourceProductDocument = testDataFactory.product.document.generic();
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
      productType: ProductType.Generic,
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

    it('if products are of different product types', async () => {
      const differentProductTypeDocument = testDataFactory.product.document.specific();

      mockProductService.functions.listProductsByIds.mockResolvedValue([
        targetProductDocument,
        differentProductTypeDocument,
      ]);

      await service({
        body: [getProductId(differentProductTypeDocument)],
        productId,
      }).catch(validateError('Not all products are of the same type', 400));
      validateFunctionCall(mockProductService.functions.listProductsByIds, [
        productId,
        getProductId(differentProductTypeDocument),
      ]);
      validateFunctionCall(mockProductService.functions.mergeProducts);
      expect.assertions(4);
    });

    it('if products are not siblings', async () => {
      const targetSpecificProductDocument = testDataFactory.product.document.specific();
      const sourceSpecificProductDocument = testDataFactory.product.document.specific();

      mockProductService.functions.listProductsByIds.mockResolvedValue([
        targetSpecificProductDocument,
        sourceSpecificProductDocument,
      ]);

      await service({
        body: [getProductId(sourceSpecificProductDocument)],
        productId: getProductId(targetSpecificProductDocument),
      }).catch(validateError('Not all products are siblings', 400));
      validateFunctionCall(mockProductService.functions.listProductsByIds, [
        getProductId(targetSpecificProductDocument),
        getProductId(sourceSpecificProductDocument),
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
        productType: ProductType.Generic,
      });
      expect.assertions(4);
    });
  });
});
