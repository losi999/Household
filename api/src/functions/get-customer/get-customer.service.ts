import { httpErrors } from '@household/api/common/error-handlers';
import { ICustomerDocumentConverter } from '@household/shared/converters/customer-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICustomerService } from '@household/shared/services/customer-service';
import { Customer } from '@household/shared/types/types';

export interface IGetCustomerService {
  (ctx: {
    customerId: Customer.Id;
  }): Promise<Customer.Response>;
}

export const getCustomerServiceFactory = (
  customerService: ICustomerService,
  calendarEntryService: ICalendarEntryService,
  customerDocumentConverter: ICustomerDocumentConverter,
): IGetCustomerService => {
  return async ({ customerId }) => {
    const [
      customer,
      workEntries,
    ] = await Promise.all([
      customerService.getCustomerById(customerId).catch(httpErrors.customer.getById({
        customerId,
      })),
      calendarEntryService.listCalendarWorkEntriesByCustomerId(customerId).catch(httpErrors.calendarEntry.list()),
    ]);

    httpErrors.customer.notFound({
      customerId,
      customer,
    });

    return customerDocumentConverter.toResponse(customer, workEntries);
  };
};
