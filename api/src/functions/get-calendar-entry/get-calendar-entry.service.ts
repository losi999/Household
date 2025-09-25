import { httpErrors } from '@household/api/common/error-handlers';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { CalendarEntryType } from '@household/shared/enums';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { Calendar } from '@household/shared/types/types';

export interface IGetCalendarEntryService {
  (ctx: Calendar.Entry.CalendarEntryId): Promise<Calendar.Entry.Response>;
}

export const getCalendarEntryServiceFactory = (
  calendarEntryService: ICalendarEntryService,
  calendarEntryDocumentConverter: ICalendarEntryDocumentConverter,
): IGetCalendarEntryService => {
  return async ({ calendarEntryId }) => {
    const queried = await calendarEntryService.getCalendarEntryById(calendarEntryId, {
      entryType: CalendarEntryType.Work,
    }).catch(httpErrors.calendarEntry.getById({
      calendarEntryId,
    }));

    httpErrors.calendarEntry.notFound({
      calendarEntry: queried,
      calendarEntryId,
    });

    return calendarEntryDocumentConverter.toResponse(queried);
  };
};

