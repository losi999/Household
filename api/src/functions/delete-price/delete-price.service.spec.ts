import { IDeletePriceService, deletePriceServiceFactory } from '@household/api/functions/delete-price/delete-price.service';
import { createPriceId } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { IPriceService } from '@household/shared/services/price-service';

describe('Delete price service', () => {
  let service: IDeletePriceService;
  let mockPriceService: Mock<IPriceService>;

  beforeEach(() => {
    mockPriceService = createMockService('deletePrice');

    service = deletePriceServiceFactory(mockPriceService.service);
  });

  const priceId = createPriceId();

  it('should return if document is deleted', async () => {
    mockPriceService.functions.deletePrice.mockResolvedValue(undefined);

    await service({
      priceId,
    });
    validateFunctionCall(mockPriceService.functions.deletePrice, priceId);
    expect.assertions(1);
  });

  describe('should throw error', () => {
    it('if unable to delete document', async () => {
      mockPriceService.functions.deletePrice.mockRejectedValue('this is a mongo error');

      await service({
        priceId,
      }).catch(validateError('Error while deleting price', 500));
      validateFunctionCall(mockPriceService.functions.deletePrice, priceId);
      expect.assertions(3);
    });
  });
});
