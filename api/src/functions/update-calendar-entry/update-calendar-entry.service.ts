import { httpErrors } from '@household/api/common/error-handlers';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { CalendarEntryType } from '@household/shared/enums';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICustomerService } from '@household/shared/services/customer-service';
import { IPriceService } from '@household/shared/services/price-service';
import { Api } from '@household/shared/types/api';
import { DocumentUpdate } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';

export interface IUpdateCalendarEntryService {
  (ctx: {
    body: Requests.CalendarEntry;
    calendarEntryId: Api.Calendar.Entry.Id;
    expiresIn: number;
  }): Promise<unknown>;
}

export const updateCalendarEntryServiceFactory = (
  calendarEntryService: ICalendarEntryService,
  calendarEntryDocumentConverter: ICalendarEntryDocumentConverter,
  customerService: ICustomerService,
  priceService: IPriceService,
): IUpdateCalendarEntryService => {
  return async ({ body, calendarEntryId, expiresIn }) => {
    const queried = await calendarEntryService.findCalendarEntryById(calendarEntryId).catch(httpErrors.calendarEntry.getById({
      calendarEntryId,
    }));

    httpErrors.calendarEntry.notFound({
      calendarEntry: queried,
      calendarEntryId,
    });

    httpErrors.calendarEntry.entryTypeChanged({
      calendarEntry: queried,
      request: body,
    });

    httpErrors.calendarEntry.alreadyResolved(queried);
    
    let update: DocumentUpdate<Documents.CalendarEntry>;
    if (body.entryType === CalendarEntryType.Work) {
      const customer = await customerService.findCustomerById(body.customerId).catch(httpErrors.customer.getById({
        customerId: body.customerId,
      }));

      httpErrors.customer.notFound({
        customer,
        customerId: body.customerId,
      }, 400);
     
      const priceIds = body.prices?.map(p => p.priceId) ?? [];

      const prices = await priceService.findPricesByIds(priceIds).catch(httpErrors.price.listByIds(priceIds));

      httpErrors.price.multipleNotFound({
        priceIds,
        prices,
      });
      update = calendarEntryDocumentConverter.update({
        body,
        customer,
        prices,
      }, expiresIn);
    } else { 
      update = calendarEntryDocumentConverter.update({
        body,
      }, expiresIn);
    }

    return calendarEntryService.updateCalendarEntry(calendarEntryId, update).catch(httpErrors.calendarEntry.update({
      calendarEntryId,
      update,
    }));
  };
};
