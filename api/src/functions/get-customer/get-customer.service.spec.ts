import { IGetCustomerService, getCustomerServiceFactory } from '@household/api/functions/get-customer/get-customer.service';
import { createCustomerDocument, createCustomerResponse } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCustomerId } from '@household/shared/common/utils';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';

describe('Get customer service', () => {
  let service: IGetCustomerService;
  let mockCustomerService: Mock<ICustomerService>;
  let mockCustomerDocumentConverter: Mock<ICustomerDocumentConverter>;

  beforeEach(() => {
    mockCustomerService = createMockService('findCustomerById');
    mockCustomerDocumentConverter = createMockService('toResponse');

    service = getCustomerServiceFactory(mockCustomerService.service, mockCustomerDocumentConverter.service);
  });

  const queriedDocument = createCustomerDocument();
  const customerId = getCustomerId(queriedDocument);
  const convertedResponse = createCustomerResponse();

  it('should return customer', async () => {
    mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedDocument);
    mockCustomerDocumentConverter.functions.toResponse.mockReturnValue(convertedResponse);

    const result = await service({
      customerId,
    });
    expect(result).toEqual(convertedResponse);
    validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
    validateFunctionCall(mockCustomerDocumentConverter.functions.toResponse, queriedDocument);
    expect.assertions(3);
  });
  describe('should throw error', () => {
    it('if unable to query customer', async () => {
      mockCustomerService.functions.findCustomerById.mockRejectedValue('this is a mongo error');

      await service({
        customerId,
      }).catch(validateError('Error while getting customer', 500));
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockCustomerDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });

    it('if no customer found', async () => {
      mockCustomerService.functions.findCustomerById.mockResolvedValue(undefined);

      await service({
        customerId,
      }).catch(validateError('No customer found', 404));
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockCustomerDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });
  });
});
