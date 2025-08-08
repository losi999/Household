import { IUpdateCustomerService, updateCustomerServiceFactory } from '@household/api/functions/update-customer/update-customer.service';
import { createCustomerRequest, createCustomerDocument, createDocumentUpdate2 } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCustomerId } from '@household/shared/common/utils';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';

describe('Update customer service', () => {
  let service: IUpdateCustomerService;
  let mockCustomerService: Mock<ICustomerService>;
  let mockCustomerDocumentConverter: Mock<ICustomerDocumentConverter>;

  beforeEach(() => {
    mockCustomerService = createMockService('findCustomerById', 'updateCustomer');
    mockCustomerDocumentConverter = createMockService('update');

    service = updateCustomerServiceFactory(mockCustomerService.service, mockCustomerDocumentConverter.service);
  });

  const body = createCustomerRequest();
  const queriedDocument = createCustomerDocument();
  const customerId = getCustomerId(queriedDocument);
  const updateQuery = createDocumentUpdate2({
    update: {
      name: 'updated',
    },
  });

  it('should return if customer is updated', async () => {
    mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedDocument);
    mockCustomerDocumentConverter.functions.update.mockReturnValue(updateQuery);
    mockCustomerService.functions.updateCustomer.mockResolvedValue(undefined);

    await service({
      body,
      customerId,
      expiresIn: undefined,
    });
    validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
    validateFunctionCall(mockCustomerDocumentConverter.functions.update, body, undefined);
    validateFunctionCall(mockCustomerService.functions.updateCustomer, customerId, updateQuery);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query customer', async () => {
      mockCustomerService.functions.findCustomerById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        customerId,
        expiresIn: undefined,
      }).catch(validateError('Error while getting customer', 500));
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockCustomerDocumentConverter.functions.update);
      validateFunctionCall(mockCustomerService.functions.updateCustomer);
      expect.assertions(5);
    });

    it('if customer not found', async () => {
      mockCustomerService.functions.findCustomerById.mockResolvedValue(undefined);

      await service({
        body,
        customerId,
        expiresIn: undefined,
      }).catch(validateError('No customer found', 404));
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockCustomerDocumentConverter.functions.update);
      validateFunctionCall(mockCustomerService.functions.updateCustomer);
      expect.assertions(5);
    });

    it('if unable to update customer', async () => {
      mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedDocument);
      mockCustomerDocumentConverter.functions.update.mockReturnValue(updateQuery);
      mockCustomerService.functions.updateCustomer.mockRejectedValue('this is a mongo error');

      await service({
        body,
        customerId,
        expiresIn: undefined,
      }).catch(validateError('Error while updating customer', 500));
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockCustomerDocumentConverter.functions.update, body, undefined);
      validateFunctionCall(mockCustomerService.functions.updateCustomer, customerId, updateQuery);
      expect.assertions(5);
    });
  });
});
