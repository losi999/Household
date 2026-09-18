import { httpErrors } from '@household/api/common/error-handlers';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { Api } from '@household/shared/types/api';
import { Responses } from '@household/shared/types/responses';

export interface IGetCalendarEntryService {
  (ctx: Api.Calendar.Entry.CalendarEntryId): Promise<Responses.CalendarEntry>;
}

export const getCalendarEntryServiceFactory = (
  calendarEntryService: ICalendarEntryService,
  calendarEntryDocumentConverter: ICalendarEntryDocumentConverter,
): IGetCalendarEntryService => {
  return async ({ calendarEntryId }) => {
    const queried = await calendarEntryService.getCalendarEntryById(calendarEntryId).catch(httpErrors.calendarEntry.getById({
      calendarEntryId,
    }));

    httpErrors.calendarEntry.notFound({
      calendarEntry: queried,
      calendarEntryId,
    });

    return calendarEntryDocumentConverter.toResponse(queried);
  };
};

