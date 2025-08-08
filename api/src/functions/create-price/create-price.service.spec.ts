import { ICreatePriceService, createPriceServiceFactory } from '@household/api/functions/create-price/create-price.service';
import { createPriceRequest, createPriceDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getPriceId } from '@household/shared/common/utils';
import { IPriceDocumentConverter } from '@household/shared/converters/price-document-converter';
import { IPriceService } from '@household/shared/services/price-service';

describe('Create price service', () => {
  let service: ICreatePriceService;
  let mockPriceService: Mock<IPriceService>;
  let mockPriceDocumentConverter: Mock<IPriceDocumentConverter>;

  beforeEach(() => {
    mockPriceService = createMockService('savePrice');
    mockPriceDocumentConverter = createMockService('create');

    service = createPriceServiceFactory(mockPriceService.service, mockPriceDocumentConverter.service);
  });

  const body = createPriceRequest();
  const convertedPriceDocument = createPriceDocument();
  const priceId = getPriceId(convertedPriceDocument);

  it('should return new id', async () => {
    mockPriceDocumentConverter.functions.create.mockReturnValue(convertedPriceDocument);
    mockPriceService.functions.savePrice.mockResolvedValue(convertedPriceDocument);

    const result = await service({
      body,
      expiresIn: undefined,
    });
    expect(result).toEqual(priceId.toString()),
    validateFunctionCall(mockPriceDocumentConverter.functions.create, body, undefined);
    validateFunctionCall(mockPriceService.functions.savePrice, convertedPriceDocument);
    expect.assertions(3);
  });
  describe('should throw error', () => {
    it('if unable to save document', async () => {
      mockPriceDocumentConverter.functions.create.mockReturnValue(convertedPriceDocument);
      mockPriceService.functions.savePrice.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving price', 500));
      validateFunctionCall(mockPriceDocumentConverter.functions.create, body, undefined);
      validateFunctionCall(mockPriceService.functions.savePrice, convertedPriceDocument);
      expect.assertions(4);
    });
  });
});
