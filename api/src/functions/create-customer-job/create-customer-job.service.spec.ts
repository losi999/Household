import { createCustomerJobServiceFactory, ICreateCustomerJobService } from '@household/api/functions/create-customer-job/create-customer-job.service';
import { createDocumentUpdate, testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getPriceId } from '@household/shared/common/utils';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICustomerService } from '@household/shared/services/customer-service';
import { IPriceService } from '@household/shared/services/price-service';

describe('Create customer job service', () => {
  let service: ICreateCustomerJobService;
  let mockCustomerService: MockService<ICustomerService>;
  let mockCustomerDocumentConverter: MockService<ICustomerDocumentConverter>;
  let mockPriceService: MockService<IPriceService>;
  beforeEach(() => {
    mockCustomerService = createMockService('findCustomerById', 'updateCustomer');
    mockCustomerDocumentConverter = createMockService('addJob');
    mockPriceService = createMockService('findPricesByIds');

    service = createCustomerJobServiceFactory(mockCustomerService.service, mockCustomerDocumentConverter.service, mockPriceService.service);
  });

  const queriedPriceDocument = testDataFactory.price.document();
  const priceId = getPriceId(queriedPriceDocument);
  const body = testDataFactory.customer.job.request({
    body: {
      name: 'new job',
    },
    prices: {
      custom: [testDataFactory.price.base()],
      listed: [
        {
          priceId,
          quantity: 1,
        },
      ],
    }
    ,
  });
  const queriedCustomer = testDataFactory.customer.document({
    jobs: [{}],
  });
  const documentUpdate = createDocumentUpdate();
  const customerId = testDataFactory.customer.id();

  it('should return', async () => {
    mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomer);
    mockPriceService.functions.findPricesByIds.mockResolvedValue([queriedPriceDocument]);
    mockCustomerDocumentConverter.functions.addJob.mockReturnValue(documentUpdate);
    mockCustomerService.functions.updateCustomer.mockResolvedValue(undefined);

    await service({
      body,
      customerId,
    });
    validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
    validateFunctionCall(mockPriceService.functions.findPricesByIds, [priceId]);
    validateFunctionCall(mockCustomerDocumentConverter.functions.addJob, body, [queriedPriceDocument]);
    validateFunctionCall(mockCustomerService.functions.updateCustomer, customerId, documentUpdate);
    expect.assertions(4);
  });

  describe('should throw error', () => {
    it('if unable to query customer', async () => {
      mockCustomerService.functions.findCustomerById.mockRejectedValue('this is a mongo error');

      await service({
        body,
        customerId,
      }).catch(validateError('Error while getting customer', 500));
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds);
      validateFunctionCall(mockCustomerDocumentConverter.functions.addJob);
      validateFunctionCall(mockCustomerService.functions.updateCustomer);
      expect.assertions(6);
    });

    it('if no customer found', async () => {
      mockCustomerService.functions.findCustomerById.mockResolvedValue(undefined);

      await service({
        body,
        customerId,
      }).catch(validateError('No customer found', 404));
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds);
      validateFunctionCall(mockCustomerDocumentConverter.functions.addJob);
      validateFunctionCall(mockCustomerService.functions.updateCustomer);
      expect.assertions(6);
    });

    it('if job name already exists', async () => {
      const body = testDataFactory.customer.job.request({
        body: {
          name: queriedCustomer.jobs[0].name,
        },
      });
      mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomer);

      await service({
        body,
        customerId,
      }).catch(validateError('Duplicate customer job name', 400));
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds);
      validateFunctionCall(mockCustomerDocumentConverter.functions.addJob);
      validateFunctionCall(mockCustomerService.functions.updateCustomer);
      expect.assertions(6);
    });

    it('if unable to query prices', async () => {
      mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomer);
      mockPriceService.functions.findPricesByIds.mockRejectedValue('this is a mongo error');

      await service({
        body,
        customerId,
      }).catch(validateError('Error while listing prices by ids', 500));
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds, [priceId]);
      validateFunctionCall(mockCustomerDocumentConverter.functions.addJob);
      validateFunctionCall(mockCustomerService.functions.updateCustomer);
      expect.assertions(6);
    });

    it('if some of the prices are not found', async () => {
      mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomer);
      mockPriceService.functions.findPricesByIds.mockResolvedValue([]);

      await service({
        body,
        customerId,
      }).catch(validateError('Some of the prices are not found', 400));
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds, [priceId]);
      validateFunctionCall(mockCustomerDocumentConverter.functions.addJob);
      validateFunctionCall(mockCustomerService.functions.updateCustomer);
      expect.assertions(6);
    });

    it('if unable to update document', async () => {
      mockCustomerService.functions.findCustomerById.mockResolvedValue(queriedCustomer);
      mockPriceService.functions.findPricesByIds.mockResolvedValue([queriedPriceDocument]);
      mockCustomerDocumentConverter.functions.addJob.mockReturnValue(documentUpdate);
      mockCustomerService.functions.updateCustomer.mockRejectedValue('this is a mongo error');

      await service({
        body,
        customerId,
      }).catch(validateError('Error while updating customer', 500));
      validateFunctionCall(mockCustomerService.functions.findCustomerById, customerId);
      validateFunctionCall(mockPriceService.functions.findPricesByIds, [priceId]);
      validateFunctionCall(mockCustomerDocumentConverter.functions.addJob, body, [queriedPriceDocument]);
      validateFunctionCall(mockCustomerService.functions.updateCustomer, customerId, documentUpdate);
      expect.assertions(6);
    });
  });
});
