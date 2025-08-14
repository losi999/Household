import { httpErrors } from '@household/api/common/error-handlers';
import { getCalendarEntryId } from '@household/shared/common/utils';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { Calendar } from '@household/shared/types/types';

export interface ICreateCalendarEntryService {
  (ctx: {
    body: Calendar.Entry.Request;
    expiresIn: number;
  }): Promise<Calendar.Entry.Id>;
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
