import { httpErrors } from '@household/api/common/error-handlers';
import { isPriceBase } from '@household/shared/common/type-guards';
import { getCalendarEntryId } from '@household/shared/common/utils';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { CalendarEntryType } from '@household/shared/enums';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { ICustomerService } from '@household/shared/services/customer-service';
import { IPriceService } from '@household/shared/services/price-service';
import { Calendar, Price } from '@household/shared/types/types';

export interface ICreateCalendarEntryService {
  (ctx: {
    body: Calendar.Entry.Request;
    expiresIn: number;
  }): Promise<Calendar.Entry.Id>;
}

export const createCalendarEntryServiceFactory = (
  calendarEntryService: ICalendarEntryService,
  calendarEntryDocumentConverter: ICalendarEntryDocumentConverter,
  customerService: ICustomerService,
  priceService: IPriceService,
): ICreateCalendarEntryService => {
  return async ({ body, expiresIn }) => {
    let document: Calendar.Entry.Document;
    if (body.entryType === CalendarEntryType.Work) {
      const customer = await customerService.findCustomerById(body.customerId);

      const priceIds = body.prices?.reduce<Price.Id[]>((accumulator, currentValue) => {
        if (!isPriceBase(currentValue)) {
          return [
            ...accumulator,
            currentValue.priceId,
          ];
        }
      
        return accumulator;
      }, []) ?? [];

      const prices = await priceService.findPricesByIds(priceIds);
      
      httpErrors.price.multipleNotFound({
        priceIds,
        prices,
      });

      document = calendarEntryDocumentConverter.create({
        body,
        customer,
        prices,
      }, expiresIn);

    } else { 
      document = calendarEntryDocumentConverter.create({
        body,
      }, expiresIn);
    }

    const saved = await calendarEntryService.saveCalendarEntry(document).catch(httpErrors.calendarEntry.save(document));
    
    return getCalendarEntryId(saved);
  };
};
