import { IListPricesService, listPricesServiceFactory } from '@household/api/functions/list-prices/list-prices.service';
import { createPriceDocument, createPriceResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
import { IPriceService } from '@household/shared/services/price-service';

describe('List prices service', () => {
  let service: IListPricesService;
  let mockPriceService: Mock<IPriceService>;
  let mockPriceDocumentConverter: Mock<IPriceDocumentConverter>;

  beforeEach(() => {
    mockPriceService = createMockService('listPrices');
    mockPriceDocumentConverter = createMockService('toResponseList');

    service = listPricesServiceFactory(mockPriceService.service, mockPriceDocumentConverter.service);
  });

  const queriedDocument = createPriceDocument();
  const convertedResponse = createPriceResponse();

  it('should return documents', async () => {
    mockPriceService.functions.listPrices.mockResolvedValue([queriedDocument]);
    mockPriceDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

    const result = await service();
    expect(result).toEqual([convertedResponse]);
    expect(mockPriceService.functions.listPrices).toHaveBeenCalled();
    validateFunctionCall(mockPriceDocumentConverter.functions.toResponseList, [queriedDocument]);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query prices', async () => {
      mockPriceService.functions.listPrices.mockRejectedValue('this is a mongo error');

      await service().catch(validateError('Error while listing prices', 500));
      expect(mockPriceService.functions.listPrices).toHaveBeenCalled();
      validateFunctionCall(mockPriceDocumentConverter.functions.toResponseList);
      expect.assertions(4);
    });
  });
});
