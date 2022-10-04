import { IDeleteProductService, deleteProductServiceFactory } from '@household/api/functions/delete-product/delete-product.service';
import { createProductId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IProductService } from '@household/shared/services/product-service';

describe('Delete product service', () => {
  let service: IDeleteProductService;
  let mockProductService: Mock<IProductService>;

  beforeEach(() => {
    mockProductService = createMockService('deleteProduct');

    service = deleteProductServiceFactory(mockProductService.service);
  });

  const productId = createProductId();

  it('should return if document is deleted', async () => {
    mockProductService.functions.deleteProduct.mockResolvedValue(undefined);

    await service({
      productId,
    });
    validateFunctionCall(mockProductService.functions.deleteProduct, productId);
    expect.assertions(1);
  });

  describe('should throw error', () => {
    it('if unable to delete document', async () => {
      mockProductService.functions.deleteProduct.mockRejectedValue('this is a mongo error');

      await service({
        productId,
      }).catch(validateError('Error while deleting product', 500));
      validateFunctionCall(mockProductService.functions.deleteProduct, productId);
      expect.assertions(3);
    });
  });
});
