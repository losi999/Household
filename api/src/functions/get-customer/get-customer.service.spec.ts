import { IGetCustomerService, getCustomerServiceFactory } from '@household/api/functions/get-customer/get-customer.service';
import { calendarEntryDataFactory, customerDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICustomerService } from '@household/shared/services/customer-service';

describe('Get customer service', () => {
  let service: IGetCustomerService;
  let mockCustomerService: Mock<ICustomerService>;
  let mockCalendarEntryService: Mock<ICalendarEntryService>;
  let mockCustomerDocumentConverter: Mock<ICustomerDocumentConverter>;

  beforeEach(() => {
    mockCustomerService = createMockService('getCustomerById');
    mockCalendarEntryService = createMockService('listCalendarWorkEntriesByCustomerId');
    mockCustomerDocumentConverter = createMockService('toResponse');

    service = getCustomerServiceFactory(mockCustomerService.service, mockCalendarEntryService.service, mockCustomerDocumentConverter.service);
  });

  const queriedCustomer = customerDataFactory.document();
  const customerId = customerDataFactory.id();
  const convertedResponse = customerDataFactory.response();
  const queriedCalendarEntry = calendarEntryDataFactory.document();

  it('should return customer', async () => {
    mockCustomerService.functions.getCustomerById.mockResolvedValue(queriedCustomer);
    mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId.mockResolvedValue([queriedCalendarEntry]);
    mockCustomerDocumentConverter.functions.toResponse.mockReturnValue(convertedResponse);

    const result = await service({
      customerId,
    });
    expect(result).toEqual(convertedResponse);
    validateFunctionCall(mockCustomerService.functions.getCustomerById, customerId);
    validateFunctionCall(mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId, customerId);
    validateFunctionCall(mockCustomerDocumentConverter.functions.toResponse, queriedCustomer, [queriedCalendarEntry]);
    expect.assertions(4);
  });

  describe('should throw error', () => {
    it('if unable to query customer', async () => {
      mockCustomerService.functions.getCustomerById.mockRejectedValue('this is a mongo error');
      mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId.mockResolvedValue([queriedCalendarEntry]);

      await service({
        customerId,
      }).catch(validateError('Error while getting customer', 500));
      validateFunctionCall(mockCustomerService.functions.getCustomerById, customerId);
      validateFunctionCall(mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId, customerId);
      validateFunctionCall(mockCustomerDocumentConverter.functions.toResponse);
      expect.assertions(5);
    });

    it('if unable to query calendar entries', async () => {
      mockCustomerService.functions.getCustomerById.mockResolvedValue(undefined);
      mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId.mockRejectedValue('this is a mongo error');

      await service({
        customerId,
      }).catch(validateError('Error while listing calendar entries', 500));
      validateFunctionCall(mockCustomerService.functions.getCustomerById, customerId);
      validateFunctionCall(mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId, customerId);
      validateFunctionCall(mockCustomerDocumentConverter.functions.toResponse);
      expect.assertions(5);
    });

    it('if customer not found', async () => {
      mockCustomerService.functions.getCustomerById.mockResolvedValue(undefined);
      mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId.mockResolvedValue([queriedCalendarEntry]);

      await service({
        customerId,
      }).catch(validateError('No customer found', 404));
      validateFunctionCall(mockCustomerService.functions.getCustomerById, customerId);
      validateFunctionCall(mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId, customerId);
      validateFunctionCall(mockCustomerDocumentConverter.functions.toResponse);
      expect.assertions(5);
    });
  });
});
