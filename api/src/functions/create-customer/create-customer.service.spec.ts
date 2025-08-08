import { ICreateCustomerService, createCustomerServiceFactory } from '@household/api/functions/create-customer/create-customer.service';
import { createCustomerRequest, createCustomerDocument } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCustomerId } from '@household/shared/common/utils';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';

describe('Create customer service', () => {
  let service: ICreateCustomerService;
  let mockCustomerService: Mock<ICustomerService>;
  let mockCustomerDocumentConverter: Mock<ICustomerDocumentConverter>;
  beforeEach(() => {
    mockCustomerService = createMockService('saveCustomer');
    mockCustomerDocumentConverter = createMockService('create');

    service = createCustomerServiceFactory(mockCustomerService.service, mockCustomerDocumentConverter.service);
  });

  const body = createCustomerRequest();
  const convertedCustomerDocument = createCustomerDocument();
  const customerId = getCustomerId(convertedCustomerDocument);

  it('should return new id', async () => {
    mockCustomerDocumentConverter.functions.create.mockReturnValue(convertedCustomerDocument);
    mockCustomerService.functions.saveCustomer.mockResolvedValue(convertedCustomerDocument);

    const result = await service({
      body,
      expiresIn: undefined,
    });
    expect(result).toEqual(customerId.toString()),
    validateFunctionCall(mockCustomerDocumentConverter.functions.create, body, undefined);
    validateFunctionCall(mockCustomerService.functions.saveCustomer, convertedCustomerDocument);
    expect.assertions(3);
  });
  describe('should throw error', () => {
    it('if unable to save document', async () => {
      mockCustomerDocumentConverter.functions.create.mockReturnValue(convertedCustomerDocument);
      mockCustomerService.functions.saveCustomer.mockRejectedValue('this is a mongo error');

      await service({
        body,
        expiresIn: undefined,
      }).catch(validateError('Error while saving customer', 500));
      validateFunctionCall(mockCustomerDocumentConverter.functions.create, body, undefined);
      validateFunctionCall(mockCustomerService.functions.saveCustomer, convertedCustomerDocument);
      expect.assertions(4);
    });
  });
});
