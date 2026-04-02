import { IListCustomerWorksService, listCustomerWorksServiceFactory } from '@household/api/functions/list-customer-works/list-customer-works.service';
import { testDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, MockService, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICustomerService } from '@household/shared/services/customer-service';

describe('List customer works service', () => {
  let service: IListCustomerWorksService;
  let mockCustomerService: MockService<ICustomerService>;
  let mockCalendarEntryService: MockService<ICalendarEntryService>;
  let mockCalendarEntryDocumentConverter: MockService<ICalendarEntryDocumentConverter>;

  beforeEach(() => {
    mockCustomerService = createMockService('getCustomerById');
    mockCalendarEntryService = createMockService('listCalendarWorkEntriesByCustomerId');
    mockCalendarEntryDocumentConverter = createMockService('toWorkEntryResponseBase');

    service = listCustomerWorksServiceFactory(mockCustomerService.service, mockCalendarEntryService.service, mockCalendarEntryDocumentConverter.service);
  });

  const queriedCustomer = testDataFactory.customer.document();
  const customerId = testDataFactory.customer.id();
  const queriedEntry = testDataFactory.calendar.entry.document();
  const convertedResponse = testDataFactory.calendar.entry.response.workBase();

  it('should return customer works', async () => {
    mockCustomerService.functions.getCustomerById.mockResolvedValue(queriedCustomer);
    mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId.mockResolvedValue([queriedEntry]);
    mockCalendarEntryDocumentConverter.functions.toWorkEntryResponseBase.mockReturnValue(convertedResponse);

    const result = await service({
      customerId,
    });
    expect(result).toEqual([convertedResponse]);
    validateFunctionCall(mockCustomerService.functions.getCustomerById, customerId);
    validateFunctionCall(mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId, customerId);
    validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toWorkEntryResponseBase, queriedEntry);
    expect.assertions(4);
  });

  describe('should throw error', () => {
    it('if unable to query customer', async () => {
      mockCustomerService.functions.getCustomerById.mockRejectedValue('this is a mongo error');

      await service({
        customerId,
      }).catch(validateError('Error while getting customer', 500));
      validateFunctionCall(mockCustomerService.functions.getCustomerById, customerId);
      validateFunctionCall(mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toWorkEntryResponseBase);
      expect.assertions(5);
    });

    it('if customer not found', async () => {
      mockCustomerService.functions.getCustomerById.mockResolvedValue(undefined);

      await service({
        customerId,
      }).catch(validateError('No customer found', 404));
      validateFunctionCall(mockCustomerService.functions.getCustomerById, customerId);
      validateFunctionCall(mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toWorkEntryResponseBase);
      expect.assertions(5);
    });

    it('if unable to query calendar entries', async () => {
      mockCustomerService.functions.getCustomerById.mockResolvedValue(queriedCustomer);
      mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId.mockRejectedValue('this is a mongo error');

      await service({
        customerId,
      }).catch(validateError('Error while listing calendar entries', 500));
      validateFunctionCall(mockCustomerService.functions.getCustomerById, customerId);
      validateFunctionCall(mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId, customerId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toWorkEntryResponseBase);
      expect.assertions(5);
    });
  });
});
