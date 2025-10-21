import { IGetCustomerService, getCustomerServiceFactory } from '@household/api/functions/get-customer/get-customer.service';
import { customerDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';

describe('Get customer service', () => {
  let service: IGetCustomerService;
  let mockCustomerService: Mock<ICustomerService>;
  let mockCustomerDocumentConverter: Mock<ICustomerDocumentConverter>;

  beforeEach(() => {
    mockCustomerService = createMockService('getCustomerById');
    mockCustomerDocumentConverter = createMockService('toResponse');

    service = getCustomerServiceFactory(mockCustomerService.service, mockCustomerDocumentConverter.service);
  });

  const queriedCustomer = customerDataFactory.document();
  const customerId = customerDataFactory.id();
  const convertedResponse = customerDataFactory.response();

  it('should return customer', async () => {
    mockCustomerService.functions.getCustomerById.mockResolvedValue(queriedCustomer);
    mockCustomerDocumentConverter.functions.toResponse.mockReturnValue(convertedResponse);

    const result = await service({
      customerId,
    });
    expect(result).toEqual(convertedResponse);
    validateFunctionCall(mockCustomerService.functions.getCustomerById, customerId);
    validateFunctionCall(mockCustomerDocumentConverter.functions.toResponse, queriedCustomer);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query customer', async () => {
      mockCustomerService.functions.getCustomerById.mockRejectedValue('this is a mongo error');

      await service({
        customerId,
      }).catch(validateError('Error while getting customer', 500));
      validateFunctionCall(mockCustomerService.functions.getCustomerById, customerId);
      validateFunctionCall(mockCustomerDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });

    it('if customer not found', async () => {
      mockCustomerService.functions.getCustomerById.mockResolvedValue(undefined);

      await service({
        customerId,
      }).catch(validateError('No customer found', 404));
      validateFunctionCall(mockCustomerService.functions.getCustomerById, customerId);
      validateFunctionCall(mockCustomerDocumentConverter.functions.toResponse);
      expect.assertions(4);
    });
  });
});
