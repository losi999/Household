import { IDeleteCustomerJobService, deleteCustomerJobServiceFactory } from '@household/api/functions/delete-customer-job/delete-customer-job.service';
import { createDocumentUpdate2, customerDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';

describe('Delete customer job service', () => {
  let service: IDeleteCustomerJobService;
  let mockCustomerService: Mock<ICustomerService>;
  let mockCustomerDocumentConverter: Mock<ICustomerDocumentConverter>;
  beforeEach(() => {
    mockCustomerService = createMockService('findCustomerById', 'updateCustomer');
    mockCustomerDocumentConverter = createMockService('deleteJob');

    service = deleteCustomerJobServiceFactory(mockCustomerService.service, mockCustomerDocumentConverter.service);
  });
  
  const queriedCustomerDocument = customerDataFactory.document();
  const customerId = customerDataFactory.id();
  const name = 'job name';
  const documentUpdate = createDocumentUpdate2();

  it('should return new id', async () => {
    mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomerDocument);
    mockCustomerDocumentConverter.functions.deleteJob.mockReturnValue(documentUpdate);
    mockCustomerService.functions.updateCustomer.mockResolvedValue(undefined);

    await service({
      customerId,
      name,
    });
    validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
    validateFunctionCall(mockCustomerDocumentConverter.functions.deleteJob, name);
    validateFunctionCall(mockCustomerService.functions.updateCustomer, customerId, documentUpdate);
    expect.assertions(3);
  });

  describe('should throw error', () => {
    it('if unable to query document', async () => {
      mockCustomerService.functions.findCustomerById.mockRejectedValue('this is a mongo error');

      await service({
        customerId,
        name,
      }).catch(validateError('Error while getting customer', 500));
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockCustomerDocumentConverter.functions.deleteJob);
      validateFunctionCall(mockCustomerService.functions.updateCustomer);
      expect.assertions(5);
    });

    it('if customer not found', async () => {
      mockCustomerService.functions.findCustomerById.mockResolvedValue(undefined);

      await service({
        customerId,
        name,
      }).catch(validateError('No customer found', 404));
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockCustomerDocumentConverter.functions.deleteJob);
      validateFunctionCall(mockCustomerService.functions.updateCustomer);
      expect.assertions(5);
    });

    it('if unable to update document', async () => {
      mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomerDocument);
      mockCustomerDocumentConverter.functions.deleteJob.mockReturnValue(documentUpdate);
      mockCustomerService.functions.updateCustomer.mockRejectedValue('this is a mongo error');

      await service({
        customerId,
        name,
      }).catch(validateError('Error while updating customer', 500));
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockCustomerDocumentConverter.functions.deleteJob, name);
      validateFunctionCall(mockCustomerService.functions.updateCustomer, customerId, documentUpdate);
      expect.assertions(5);
    });
  });
});
