import { IUpdateProductService, updateProductServiceFactory } from '@household/api/functions/update-product/update-product.service';
import { createProductRequest, createProductDocument, createDocumentUpdate } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getProductId } from '@household/shared/common/utils';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProductService } from '@household/shared/services/product-service';

describe('Update product service', () => {
  let service: IUpdateProductService;
  let mockProductService: Mock<IProductService>;
  let mockProductDocumentConverter: Mock<IProductDocumentConverter>;

  beforeEach(() => {
    mockProductService = createMockService('getProductById', 'updateProduct');
    mockProductDocumentConverter = createMockService('update');

    service = updateProductServiceFactory(mockProductService.service, mockProductDocumentConverter.service);
  });

  const body = createProductRequest();
  const queriedDocument = createProductDocument();
  const productId = getProductId(queriedDocument);
  const updateQuery = createDocumentUpdate({
    brand: 'updated',
  });

  it('should return if product is updated', async () => {
    mockProductService.functions.getProductById.mockResolvedValue(queriedDocument);
    mockProductDocumentConverter.functions.update.mockReturnValue(updateQuery);
    mockProductService.functions.updateProduct.mockResolvedValue(undefined);

    await service({
      body,
      productId,
      expiresIn: undefined,
    });
    validateFunctionCall(mockProductService.functions.getProductById, productId);
    validateFunctionCall(mockProductDocumentConverter.functions.update, body, undefined);
    validateFunctionCall(mockProductService.functions.updateProduct, productId, updateQuery);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query product', async () => {
      mockProductService.functions.getProductById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        productId,
        expiresIn: undefined,
      }).catch(validateError('Error while getting product', 500));
      validateFunctionCall(mockProductService.functions.getProductById, productId);
      validateFunctionCall(mockProductDocumentConverter.functions.update);
      validateFunctionCall(mockProductService.functions.updateProduct);
      expect.assertions(5);
    });

    it('if product not found', async () => {
      mockProductService.functions.getProductById.mockResolvedValue(undefined);

      await service({
        body,
        productId,
        expiresIn: undefined,
      }).catch(validateError('No product found', 404));
      validateFunctionCall(mockProductService.functions.getProductById, productId);
      validateFunctionCall(mockProductDocumentConverter.functions.update);
      validateFunctionCall(mockProductService.functions.updateProduct);
      expect.assertions(5);
    });

    it('if unable to update product', async () => {
      mockProductService.functions.getProductById.mockResolvedValue(queriedDocument);
      mockProductDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockProductService.functions.updateProduct.mockRejectedValue('this is a mongo error');

      await service({
        body,
        productId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating product', 500));
      validateFunctionCall(mockProductService.functions.getProductById, productId);
      validateFunctionCall(mockProductDocumentConverter.functions.update, body, undefined);
      validateFunctionCall(mockProductService.functions.updateProduct, productId, updateQuery);
      expect.assertions(5);
    });
  });
});
