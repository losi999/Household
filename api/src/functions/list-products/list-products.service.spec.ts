import { IListProductsService, listProductsServiceFactory } from '@household/api/functions/list-products/list-products.service';
import { createProductDocument, createProductResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IProductDocumentConverter } from '@household/shared/converters/product-document-converter';
import { IProductService } from '@household/shared/services/product-service';

describe('List products service', () => {
  let service: IListProductsService;
  let mockProductService: Mock<IProductService>;
  let mockProductDocumentConverter: Mock<IProductDocumentConverter>;

  beforeEach(() => {
    mockProductService = createMockService('listProducts');
    mockProductDocumentConverter = createMockService('toResponseList');

    service = listProductsServiceFactory(mockProductService.service, mockProductDocumentConverter.service);
  });

  const queriedDocument = createProductDocument();
  const convertedResponse = createProductResponse();

  it('should return documents', async () => {
    mockProductService.functions.listProducts.mockResolvedValue([queriedDocument]);
    mockProductDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

    const result = await service();
    expect(result).toEqual([convertedResponse]);
    expect(mockProductService.functions.listProducts).toHaveBeenCalled();
    validateFunctionCall(mockProductDocumentConverter.functions.toResponseList, [queriedDocument]);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query products', async () => {
      mockProductService.functions.listProducts.mockReductedValue('this is a mongo error');

      await service().catch(validateError('Error while listing products', 500));
      expect(mockProductService.functions.listProducts).toHaveBeenCalled();
      validateFunctionCall(mockProductDocumentConverter.functions.toResponseList);
      expect.assertions(4);
    });
  });
});
