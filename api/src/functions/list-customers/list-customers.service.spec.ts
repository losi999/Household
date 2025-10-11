import { IListCustomersService, listCustomersServiceFactory } from '@household/api/functions/list-customers/list-customers.service';
import { calendarEntryDataFactory, customerDataFactory } from '@household/shared/common/test-data-factory';
import { createMockService, Mock, validateError, validateFunctionCall } from '@household/shared/common/unit-testing';
import { getCustomerId } from '@household/shared/common/utils';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICustomerService } from '@household/shared/services/customer-service';

describe('List customers service', () => {
  let service: IListCustomersService;
  let mockCustomerService: Mock<ICustomerService>;
  let mockCalendarEntryService: Mock<ICalendarEntryService>;
  let mockCustomerDocumentConverter: Mock<ICustomerDocumentConverter>;

  beforeEach(() => {
    mockCustomerService = createMockService('listCustomers');
    mockCalendarEntryService = createMockService('listCalendarWorkEntriesGroupedByCustomer');
    mockCustomerDocumentConverter = createMockService('toResponseList');

    service = listCustomersServiceFactory(mockCustomerService.service, mockCalendarEntryService.service, mockCustomerDocumentConverter.service);
  });

  const queriedCustomer = customerDataFactory.document();
  const queriedCalendarEntry = {
    [getCustomerId(queriedCustomer)]: [calendarEntryDataFactory.document()],
  };
  const convertedResponse = customerDataFactory.response();

  it('should return documents', async () => {
    mockCustomerService.functions.listCustomers.mockResolvedValue([queriedCustomer]);
    mockCalendarEntryService.functions.listCalendarWorkEntriesGroupedByCustomer.mockResolvedValue(queriedCalendarEntry);
    mockCustomerDocumentConverter.functions.toResponseList.mockReturnValue([convertedResponse]);

    const result = await service();
    expect(result).toEqual([convertedResponse]);
    expect(mockCustomerService.functions.listCustomers).toHaveBeenCalled();
    expect(mockCalendarEntryService.functions.listCalendarWorkEntriesGroupedByCustomer).toHaveBeenCalled();
    validateFunctionCall(mockCustomerDocumentConverter.functions.toResponseList, [queriedCustomer], queriedCalendarEntry);
    expect.assertions(4);
  });

  describe('should throw error', () => {
    it('if unable to query customers', async () => {
      mockCustomerService.functions.listCustomers.mockRejectedValue('this is a mongo error');
      mockCalendarEntryService.functions.listCalendarWorkEntriesGroupedByCustomer.mockResolvedValue(queriedCalendarEntry);

      await service().catch(validateError('Error while listing customers', 500));
      expect(mockCustomerService.functions.listCustomers).toHaveBeenCalled();
      expect(mockCalendarEntryService.functions.listCalendarWorkEntriesGroupedByCustomer).toHaveBeenCalled();
      validateFunctionCall(mockCustomerDocumentConverter.functions.toResponseList);
      expect.assertions(5);
    });

    it('if unable to query calendar entries', async () => {

      mockCustomerService.functions.listCustomers.mockResolvedValue([queriedCustomer]);
      mockCalendarEntryService.functions.listCalendarWorkEntriesGroupedByCustomer.mockRejectedValue('this is a mongo error');

      await service().catch(validateError('Error while listing calendar entries', 500));
      expect(mockCustomerService.functions.listCustomers).toHaveBeenCalled();
      expect(mockCalendarEntryService.functions.listCalendarWorkEntriesGroupedByCustomer).toHaveBeenCalled();
      validateFunctionCall(mockCustomerDocumentConverter.functions.toResponseList);
      expect.assertions(5);
    });
  });
});
