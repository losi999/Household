import { IRemoveCustomerFromBlacklistService, removeCustomerFromBlacklistServiceFactory } from '@household/api/functions/remove-customer-from-blacklist/remove-customer-from-blacklist.service';
import { createDocumentUpdate, testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall, validateNthFunctionCall } from '@household/shared/common/unit-testing';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';

describe('Remove customer from blacklist service', () => {
  let service: IRemoveCustomerFromBlacklistService;
  let mockCustomerService: MockService<ICustomerService>;
  let mockCustomerDocumentConverter: MockService<ICustomerDocumentConverter>;
  beforeEach(() => {
    mockCustomerService = createMockService('findCustomerById', 'updateCustomers');
    mockCustomerDocumentConverter = createMockService('removeBlacklistedCustomer');

    service = removeCustomerFromBlacklistServiceFactory(mockCustomerService.service, mockCustomerDocumentConverter.service);
  });

  const customerIdA = testDataFactory.customer.id();
  const queriedCustomerA = testDataFactory.customer.document();
  const documentUpdateA = createDocumentUpdate({
    update: {
      $set: {
        update: 'A',
      },
    },
  });
  const documentUpdateB = createDocumentUpdate({
    update: {
      $set: {
        update: 'B',
      },
    },
  });
  const customerIdB = testDataFactory.customer.id();
  const queriedCustomerB = testDataFactory.customer.document();

  const body = [
    customerIdA,
    customerIdB,
  ];

  it('should return', async () => {
    mockCustomerService.functions.findCustomerById.mockResolvedValueOnce(queriedCustomerA);
    mockCustomerService.functions.findCustomerById.mockResolvedValueOnce(queriedCustomerB);
    mockCustomerDocumentConverter.functions.removeBlacklistedCustomer.mockReturnValueOnce(documentUpdateA);
    mockCustomerDocumentConverter.functions.removeBlacklistedCustomer.mockReturnValueOnce(documentUpdateB);
    mockCustomerService.functions.updateCustomers.mockResolvedValue(undefined);

    await service(body);
    validateNthFunctionCall(mockCustomerService.functions.findCustomerById, 1, customerIdA);
    validateNthFunctionCall(mockCustomerService.functions.findCustomerById, 2, customerIdB);
    validateNthFunctionCall(mockCustomerDocumentConverter.functions.removeBlacklistedCustomer, 1, customerIdB);
    validateNthFunctionCall(mockCustomerDocumentConverter.functions.removeBlacklistedCustomer, 2, customerIdA);
    validateFunctionCall(mockCustomerService.functions.updateCustomers, [
      {
        customerId: customerIdA,
        update: documentUpdateA,
      },
      {
        customerId: customerIdB,
        update: documentUpdateB,
      },
    ]);
    expect.assertions(5);
  });
  
  describe('should throw error', () => {
    it('if both customerId is the same', async () => {
      await service([
        customerIdA,
        customerIdA,
      ]).catch(validateError('Customer cannot be blacklisted with itself', 400));
      validateFunctionCall(mockCustomerService.functions.findCustomerById);
      validateFunctionCall(mockCustomerDocumentConverter.functions.removeBlacklistedCustomer);
      validateFunctionCall(mockCustomerService.functions.updateCustomers);
      expect.assertions(5);
    });

    it('if unable to query customer', async () => {
      mockCustomerService.functions.findCustomerById.mockRejectedValue('this is a mongo error');

      await service(body).catch(validateError('Error while getting customer', 500));
      validateNthFunctionCall(mockCustomerService.functions.findCustomerById, 1, customerIdA);
      validateNthFunctionCall(mockCustomerService.functions.findCustomerById, 2, customerIdB);
      validateFunctionCall(mockCustomerDocumentConverter.functions.removeBlacklistedCustomer);
      validateFunctionCall(mockCustomerService.functions.updateCustomers);
      expect.assertions(6);
    });

    it('if customer A not found', async () => {
      mockCustomerService.functions.findCustomerById.mockResolvedValueOnce(undefined);
      mockCustomerService.functions.findCustomerById.mockResolvedValueOnce(queriedCustomerB);

      await service(body).catch(validateError('No customer found', 404));
      validateNthFunctionCall(mockCustomerService.functions.findCustomerById, 1, customerIdA);
      validateNthFunctionCall(mockCustomerService.functions.findCustomerById, 2, customerIdB);
      validateFunctionCall(mockCustomerDocumentConverter.functions.removeBlacklistedCustomer);
      validateFunctionCall(mockCustomerService.functions.updateCustomers);
      expect.assertions(6);
    });

    it('if customer B not found', async () => {
      mockCustomerService.functions.findCustomerById.mockResolvedValueOnce(queriedCustomerA);
      mockCustomerService.functions.findCustomerById.mockResolvedValueOnce(undefined);

      await service(body).catch(validateError('No customer found', 404));
      validateNthFunctionCall(mockCustomerService.functions.findCustomerById, 1, customerIdA);
      validateNthFunctionCall(mockCustomerService.functions.findCustomerById, 2, customerIdB);
      validateFunctionCall(mockCustomerDocumentConverter.functions.removeBlacklistedCustomer);
      validateFunctionCall(mockCustomerService.functions.updateCustomers);
      expect.assertions(6);
    });

    it('if unable to update document', async () => {
      mockCustomerService.functions.findCustomerById.mockResolvedValueOnce(queriedCustomerA);
      mockCustomerService.functions.findCustomerById.mockResolvedValueOnce(queriedCustomerB);
      mockCustomerDocumentConverter.functions.removeBlacklistedCustomer.mockReturnValueOnce(documentUpdateA);
      mockCustomerDocumentConverter.functions.removeBlacklistedCustomer.mockReturnValueOnce(documentUpdateB);
      mockCustomerService.functions.updateCustomers.mockRejectedValue('this is a mongo error');

      await service(body).catch(validateError('Error while updating customer', 500));
      validateNthFunctionCall(mockCustomerService.functions.findCustomerById, 1, customerIdA);
      validateNthFunctionCall(mockCustomerService.functions.findCustomerById, 2, customerIdB);
      validateNthFunctionCall(mockCustomerDocumentConverter.functions.removeBlacklistedCustomer, 1, customerIdB);
      validateNthFunctionCall(mockCustomerDocumentConverter.functions.removeBlacklistedCustomer, 2, customerIdA);
      validateFunctionCall(mockCustomerService.functions.updateCustomers, [
        {
          customerId: customerIdA,
          update: documentUpdateA,
        },
        {
          customerId: customerIdB,
          update: documentUpdateB,
        },
      ]);
      expect.assertions(7);
    });
  });
});
