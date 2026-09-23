import { httpErrors } from '@household/api/common/error-handlers';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICustomerService } from '@household/shared/services/customer-service';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

export interface IListCustomerWorksService {
  (ctx: Api.Customer.CustomerId): Promise<Responses.CalendarEntryWorkLean[]>;
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

    return entries.map(e => calendarEntryDocumentConverter.toWorkEntryResponseBase(e));
  };
};
