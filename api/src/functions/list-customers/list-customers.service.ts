import { httpErrors } from '@household/api/common/error-handlers';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICustomerService } from '@household/shared/services/customer-service';
import { Customer } from '@household/shared/types/types';

export interface IListCustomersService {
  (): Promise<Customer.Response[]>;
}

export const listCustomersServiceFactory = (
  customerService: ICustomerService,
  calendarEntryService: ICalendarEntryService,
  customerDocumentConverter: ICustomerDocumentConverter,
): IListCustomersService => {
  return async () => {   
    const [
      customers,
      workEntries,
    ] = await Promise.all([
      customerService.listCustomers().catch(httpErrors.customer.list()),
      calendarEntryService.listCalendarWorkEntriesGroupedByCustomer().catch(httpErrors.calendarEntry.list()),
    ]);

    return customerDocumentConverter.toResponseList(customers, workEntries);
  };
};
