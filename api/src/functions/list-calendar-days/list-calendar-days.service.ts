import { httpErrors } from '@household/api/common/error-handlers';
import { ICalendarDayDocumentConverter } from '@household/shared/converters/calendar-day-document-converter';
import { ICalendarDayService } from '@household/shared/services/calendar-day-service';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

export interface IListCalendarDaysService {
  (ctx: Api.Calendar.DateRange): Promise<Responses.CalendarDay[]>;
}

export const listCalendarDaysServiceFactory = (
  calendarEntryService: ICalendarEntryService,
  calendarDayService: ICalendarDayService,
  calendarDayDocumentConverter: ICalendarDayDocumentConverter,
): IListCalendarDaysService => {
  return async ({ dateFrom, dateTo }) => {
    const [
      entries,
      days,
    ] = await Promise.all([
      calendarEntryService.listCalendarEntries({
        dateFrom,
        dateTo,
      }).catch(httpErrors.calendarEntry.list()),
      calendarDayService.listCalendarDays({
        dateFrom,
        dateTo,
      }).catch(httpErrors.calendarDay.list()),
    ]);

    return calendarDayDocumentConverter.toResponse({
      dateFrom,
      dateTo,
      entries,
      days,
    });
  };
};
