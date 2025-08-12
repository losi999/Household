import { httpErrors } from '@household/api/common/error-handlers';
import { getCalendarEntryId } from '@household/shared/common/utils';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { CalendarEntry } from '@household/shared/types/types';

export interface ICreateCalendarEntryService {
  (ctx: {
    body: CalendarEntry.Request;
    expiresIn: number;
  }): Promise<CalendarEntry.Id>;
}

export const createCalendarEntryServiceFactory = (
  calendarEntryService: ICalendarEntryService,
  calendarEntryDocumentConverter: ICalendarEntryDocumentConverter,
): ICreateCalendarEntryService => {
  return async ({ body, expiresIn }) => {
    const document = calendarEntryDocumentConverter.create(body, expiresIn);
    
    const saved = await calendarEntryService.saveCalendarEntry(document).catch(httpErrors.calendarEntry.save(document));
    
    return getCalendarEntryId(saved);
  };
};
