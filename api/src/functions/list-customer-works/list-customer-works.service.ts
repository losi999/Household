import { httpErrors } from '@household/api/common/error-handlers';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICustomerService } from '@household/shared/services/customer-service';
import { Calendar, Customer } from '@household/shared/types/types';

export interface IListCustomerWorksService {
  (ctx: {
    customerId: Customer.Id;
  }): Promise<Calendar.Entry.ResponseBase[]>;
}

export const listCustomerWorksServiceFactory = (
  customerService: ICustomerService,
  calendarEntryService: ICalendarEntryService,
  calendarEntryDocumentConverter: ICalendarEntryDocumentConverter,
): IListCustomerWorksService => {
  return async ({ customerId }) => {
    const customer = await customerService.getCustomerById(customerId).catch(httpErrors.customer.getById({
      customerId,
    }));

    httpErrors.customer.notFound({
      customerId,
      customer,
    });

    const entries = await calendarEntryService.listCalendarWorkEntriesByCustomerId(customerId).catch(httpErrors.calendarEntry.list());

    return entries.map(e => calendarEntryDocumentConverter.toResponseBase(e));
  };
};
