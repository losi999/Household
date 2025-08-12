import { httpErrors } from '@household/api/common/error-handlers';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { CalendarEntry } from '@household/shared/types/types';

export interface IListCalendarEntriesService {
  (ctx: CalendarEntry.DateRange): Promise<CalendarEntry.Response[]>;
}

export const listCalendarEntriesServiceFactory = (
  calendarEntryService: ICalendarEntryService,
  calendarEntryDocumentConverter: ICalendarEntryDocumentConverter,
): IListCalendarEntriesService => {
  return async ({ dateFrom, dateTo }) => {
    const entries = await calendarEntryService.listCalendarEntries({
      dateFrom,
      dateTo,
    }).catch(httpErrors.calendarEntry.list());

    return calendarEntryDocumentConverter.toDateRangeResponse({
      dateFrom,
      dateTo,
    }, entries);
  };
};
