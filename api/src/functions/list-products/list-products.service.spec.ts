import { IListProductsService, listProductsServiceFactory } from '@household/api/functions/list-products/list-products.service';
import { createCategoryDocument, createProductDocument, createProductGroupedResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProductService } from '@household/shared/services/product-service';

describe('List products service', () => {
  let service: IListProductsService;
  let mockProductService: Mock<IProductService>;
  let mockProductDocumentConverter: Mock<IProductDocumentConverter>;

  beforeEach(() => {
    mockProductService = createMockService('listProducts');
    mockProductDocumentConverter = createMockService('toGroupedResponseList');

    service = listProductsServiceFactory(mockProductService.service, mockProductDocumentConverter.service);
  });

  const queriedProductDocument = createProductDocument();
  const queriedCategoryDocument = createCategoryDocument({
    products: [queriedProductDocument],
  });
  const convertedResponse = createProductGroupedResponse();

  it('should return documents', async () => {
    mockProductService.functions.listProducts.mockResolvedValue([queriedCategoryDocument]);
    mockProductDocumentConverter.functions.toGroupedResponseList.mockReturnValue([convertedResponse]);

    const result = await service();
    expect(result).toEqual([convertedResponse]);
    expect(mockProductService.functions.listProducts).toHaveBeenCalled();
    validateFunctionCall(mockProductDocumentConverter.functions.toGroupedResponseList, [queriedCategoryDocument]);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query products', async () => {
      mockProductService.functions.listProducts.mockRejectedValue('this is a mongo error');

      await service().catch(validateError('Error while listing products', 500));
      expect(mockProductService.functions.listProducts).toHaveBeenCalled();
      validateFunctionCall(mockProductDocumentConverter.functions.toGroupedResponseList);
      expect.assertions(4);
    });
  });
});
