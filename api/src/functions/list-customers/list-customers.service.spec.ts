import { IListCustomersService, listCustomersServiceFactory } from '@household/api/functions/list-customers/list-customers.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';

describe('List customers service', () => {
  let service: IListCustomersService;
  let mockCustomerService: Mock<ICustomerService>;
  let mockCustomerDocumentConverter: Mock<ICustomerDocumentConverter>;

  beforeEach(() => {
    mockCustomerService = createMockService('listCustomers');
    mockCustomerDocumentConverter = createMockService('toResponseList');

    service = listCustomersServiceFactory(mockCustomerService.service, mockCustomerDocumentConverter.service);
  });

  const queriedCustomer = testDataFactory.customer.document();
  const convertedResponse = testDataFactory.customer.response();

  it('should return documents', async () => {
    mockCustomerService.functions.listCustomers.mockResolvedValue([queriedCustomer]);
    mockCustomerDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

    const result = await service();
    expect(result).toEqual([convertedResponse]);
    expect(mockCustomerService.functions.listCustomers).toHaveBeenCalled();
    validateFunctionCall(mockCustomerDocumentConverter.functions.toResponseList, [queriedCustomer]);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query customers', async () => {
      mockCustomerService.functions.listCustomers.mockRejectedValue('this is a mongo error');

      await service().catch(validateError('Error while listing customers', 500));
      expect(mockCustomerService.functions.listCustomers).toHaveBeenCalled();
      validateFunctionCall(mockCustomerDocumentConverter.functions.toResponseList);
      expect.assertions(4);
    });
  });
});
