import { httpErrors } from '@household/api/common/error-handlers';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { Calendar } from '@household/shared/types/types';

export interface IDeleteCalendarEntryService {
  (ctx: {
    calendarEntryId: Calendar.Entry.Id;
  }): Promise<unknown>;
}

export const deleteCalendarEntryServiceFactory = (
  calendarEntryService: ICalendarEntryService): IDeleteCalendarEntryService => {
  return ({ calendarEntryId }) => {
    return calendarEntryService.deleteCalendarEntry(calendarEntryId).catch(httpErrors.calendarEntry.delete({
      calendarEntryId,
    }));
  };
};
