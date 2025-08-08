import { IUpdatePriceService, updatePriceServiceFactory } from '@household/api/functions/update-price/update-price.service';
import { createPriceRequest, createPriceDocument, createDocumentUpdate2 } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getPriceId } from '@household/shared/common/utils';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
import { IPriceService } from '@household/shared/services/price-service';

describe('Update price service', () => {
  let service: IUpdatePriceService;
  let mockPriceService: Mock<IPriceService>;
  let mockPriceDocumentConverter: Mock<IPriceDocumentConverter>;

  beforeEach(() => {
    mockPriceService = createMockService('findPriceById', 'updatePrice');
    mockPriceDocumentConverter = createMockService('update');

    service = updatePriceServiceFactory(mockPriceService.service, mockPriceDocumentConverter.service);
  });

  const body = createPriceRequest();
  const queriedDocument = createPriceDocument();
  const priceId = getPriceId(queriedDocument);
  const updateQuery = createDocumentUpdate2({
    update: {
      $set: {
        name: 'updated',
      },
    },
  });

  it('should return if price is updated', async () => {
    mockPriceService.functions.findPriceById.mockResolvedValue(queriedDocument);
    mockPriceDocumentConverter.functions.update.mockReturnValue(updateQuery);
    mockPriceService.functions.updatePrice.mockResolvedValue(undefined);

    await service({
      body,
      priceId,
      expiresIn: undefined,
    });
    validateFunctionCall(mockPriceService.functions.findPriceById, priceId);
    validateFunctionCall(mockPriceDocumentConverter.functions.update, body, undefined);
    validateFunctionCall(mockPriceService.functions.updatePrice, priceId, updateQuery);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query price', async () => {
      mockPriceService.functions.findPriceById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        priceId,
        expiresIn: undefined,
      }).catch(validateError('Error while getting price', 500));
      validateFunctionCall(mockPriceService.functions.findPriceById, priceId);
      validateFunctionCall(mockPriceDocumentConverter.functions.update);
      validateFunctionCall(mockPriceService.functions.updatePrice);
      expect.assertions(5);
    });

    it('if price not found', async () => {
      mockPriceService.functions.findPriceById.mockResolvedValue(undefined);

      await service({
        body,
        priceId,
        expiresIn: undefined,
      }).catch(validateError('No price found', 404));
      validateFunctionCall(mockPriceService.functions.findPriceById, priceId);
      validateFunctionCall(mockPriceDocumentConverter.functions.update);
      validateFunctionCall(mockPriceService.functions.updatePrice);
      expect.assertions(5);
    });

    it('if unable to update price', async () => {
      mockPriceService.functions.findPriceById.mockResolvedValue(queriedDocument);
      mockPriceDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockPriceService.functions.updatePrice.mockRejectedValue('this is a mongo error');

      await service({
        body,
        priceId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating price', 500));
      validateFunctionCall(mockPriceService.functions.findPriceById, priceId);
      validateFunctionCall(mockPriceDocumentConverter.functions.update, body, undefined);
      validateFunctionCall(mockPriceService.functions.updatePrice, priceId, updateQuery);
      expect.assertions(5);
    });
  });
});
