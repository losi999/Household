import { httpErrors } from '@household/api/common/error-handlers';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { Calendar } from '@household/shared/types/types';

export interface IUpdateCalendarEntryService {
  (ctx: {
    body: Calendar.Entry.Request;
    calendarEntryId: Calendar.Entry.Id;
    expiresIn: number;
  }): Promise<unknown>;
}

export const updateCalendarEntryServiceFactory = (
  calendarEntryService: ICalendarEntryService,
  calendarEntryDocumentConverter: ICalendarEntryDocumentConverter,
): IUpdateCalendarEntryService => {
  return async ({ body, calendarEntryId, expiresIn }) => {
    const queried = await calendarEntryService.findCalendarEntryById(calendarEntryId).catch(httpErrors.calendarEntry.getById({
      calendarEntryId,
    }));

    httpErrors.calendarEntry.notFound({
      calendarEntry: queried,
      calendarEntryId,
    });

    const update = calendarEntryDocumentConverter.update(body, expiresIn);

    return calendarEntryService.updateCalendarEntry(calendarEntryId, update).catch(httpErrors.calendarEntry.update({
      calendarEntryId,
      update,
    }));
  };
};
