import { IListCustomerWorksService, listCustomerWorksServiceFactory } from '@household/api/functions/list-customer-works/list-customer-works.service';
import { calendarEntryDataFactory, customerDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICustomerService } from '@household/shared/services/customer-service';

describe('List customer works service', () => {
  let service: IListCustomerWorksService;
  let mockCustomerService: Mock<ICustomerService>;
  let mockCalendarEntryService: Mock<ICalendarEntryService>;
  let mockCalendarEntryDocumentConverter: Mock<ICalendarEntryDocumentConverter>;

  beforeEach(() => {
    mockCustomerService = createMockService('getCustomerById');
    mockCalendarEntryService = createMockService('listCalendarWorkEntriesByCustomerId');
    mockCalendarEntryDocumentConverter = createMockService('toResponseBase');

    service = listCustomerWorksServiceFactory(mockCustomerService.service, mockCalendarEntryService.service, mockCalendarEntryDocumentConverter.service);
  });

  const queriedCustomer = customerDataFactory.document();
  const customerId = customerDataFactory.id();
  const queriedEntry = calendarEntryDataFactory.document();
  const convertedResponse = calendarEntryDataFactory.responseBase();

  it('should return customer works', async () => {
    mockCustomerService.functions.getCustomerById.mockResolvedValue(queriedCustomer);
    mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId.mockResolvedValue([queriedEntry]);
    mockCalendarEntryDocumentConverter.functions.toResponseBase.mockReturnValue(convertedResponse);

    const result = await service({
      customerId,
    });
    expect(result).toEqual([convertedResponse]);
    validateFunctionCall(mockCustomerService.functions.getCustomerById, customerId);
    validateFunctionCall(mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId, customerId);
    validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseBase, queriedEntry);
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
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseBase);
      expect.assertions(5);
    });

    it('if customer not found', async () => {
      mockCustomerService.functions.getCustomerById.mockResolvedValue(undefined);

      await service({
        customerId,
      }).catch(validateError('No customer found', 404));
      validateFunctionCall(mockCustomerService.functions.getCustomerById, customerId);
      validateFunctionCall(mockCalendarEntryService.functions.listCalendarWorkEntriesByCustomerId);
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseBase);
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
      validateFunctionCall(mockCalendarEntryDocumentConverter.functions.toResponseBase);
      expect.assertions(5);
    });
  });
});
