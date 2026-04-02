import { IUpdatePriceService, updatePriceServiceFactory } from '@household/api/functions/update-price/update-price.service';
import { createDocumentUpdate2, testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getPriceId } from '@household/shared/common/utils';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
import { IPriceService } from '@household/shared/services/price-service';

describe('Update price service', () => {
  let service: IUpdatePriceService;
  let mockPriceService: MockService<IPriceService>;
  let mockPriceDocumentConverter: MockService<IPriceDocumentConverter>;

  beforeEach(() => {
    mockPriceService = createMockService('findPriceById', 'updatePrice');
    mockPriceDocumentConverter = createMockService('update');

    service = updatePriceServiceFactory(mockPriceService.service, mockPriceDocumentConverter.service);
  });

  const body = testDataFactory.price.request();
  const queriedDocument = testDataFactory.price.document();
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

    it('if price is already archived', async () => {
      mockPriceService.functions.findPriceById.mockResolvedValue({
        ...queriedDocument,
        isArchived: true,
      });

      await service({
        body,
        priceId,
        expiresIn: undefined,
      }).catch(validateError('Price is archived', 400));
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
