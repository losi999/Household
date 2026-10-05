import { IDeleteProductService, deleteProductServiceFactory } from '@household/api/functions/delete-product/delete-product.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IProductService } from '@household/shared/services/product-service';

describe('Delete product service', () => {
  let service: IDeleteProductService;
  let mockProductService: MockService<IProductService>;

  beforeEach(() => {
    mockProductService = createMockService('listProductsByParentId', 'deleteProduct');

    service = deleteProductServiceFactory(mockProductService.service);
  });

  const productId = testDataFactory.product.id();

  it('should return if document is deleted', async () => {
    mockProductService.functions.listProductsByParentId.mockResolvedValue([]);
    mockProductService.functions.deleteProduct.mockResolvedValue(undefined);

    await service({
      productId,
    });
    validateFunctionCall(mockProductService.functions.listProductsByParentId, productId);
    validateFunctionCall(mockProductService.functions.deleteProduct, productId);
    expect.assertions(2);
  });

  describe('should throw error', () => {
    it('if unable to list child products', async () => {
      mockProductService.functions.listProductsByParentId.mockRejectedValue('this is a mongo error');

      await service({
        productId,
      }).catch(validateError('Error while listing products by parent Id', 500));
      validateFunctionCall(mockProductService.functions.listProductsByParentId, productId);
      validateFunctionCall(mockProductService.functions.deleteProduct);
      expect.assertions(4);
    });

    it('if product has child products', async () => {
      mockProductService.functions.listProductsByParentId.mockResolvedValue([testDataFactory.product.document.specific()]);

      await service({
        productId,
      }).catch(validateError('Product cannot be deleted if there are child products', 400));
      validateFunctionCall(mockProductService.functions.listProductsByParentId, productId);
      validateFunctionCall(mockProductService.functions.deleteProduct);
      expect.assertions(4);
    });

    it('if unable to delete document', async () => {
      mockProductService.functions.listProductsByParentId.mockResolvedValue([]);
      mockProductService.functions.deleteProduct.mockRejectedValue('this is a mongo error');

      await service({
        productId,
      }).catch(validateError('Error while deleting product', 500));
      validateFunctionCall(mockProductService.functions.listProductsByParentId, productId);
      validateFunctionCall(mockProductService.functions.deleteProduct, productId);
      expect.assertions(4);
    });
  });
});
