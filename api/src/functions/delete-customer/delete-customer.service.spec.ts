import { IDeleteCustomerService, deleteCustomerServiceFactory } from '@household/api/functions/delete-customer/delete-customer.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICustomerService } from '@household/shared/services/customer-service';

describe('Delete customer service', () => {
  let service: IDeleteCustomerService;
  let mockCustomerService: MockService<ICustomerService>;

  beforeEach(() => {
    mockCustomerService = createMockService('deleteCustomer');

    service = deleteCustomerServiceFactory(mockCustomerService.service);
  });

  const customerId = testDataFactory.customer.id();

  it('should return if document is deleted', async () => {
    mockCustomerService.functions.deleteCustomer.mockResolvedValue(undefined);

    await service({
      customerId,
    });
    validateFunctionCall(mockCustomerService.functions.deleteCustomer, customerId);
    expect.assertions(1);
  });

  describe('should throw error', () => {
    it('if unable to delete document', async () => {
      mockCustomerService.functions.deleteCustomer.mockRejectedValue('this is a mongo error');

      await service({
        customerId,
      }).catch(validateError('Error while deleting customer', 500));
      validateFunctionCall(mockCustomerService.functions.deleteCustomer, customerId);
      expect.assertions(3);
    });
  });
});
