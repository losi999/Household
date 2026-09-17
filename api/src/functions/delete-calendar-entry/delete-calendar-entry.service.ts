import { httpErrors } from '@household/api/common/error-handlers';
import { ICalendarEntryService } from '@household/shared/services/calendar-entry-service';
import { Api } from '@household/shared/types/api';

export interface IDeleteCalendarEntryService {
  (ctx: {
    calendarEntryId: Api.Calendar.Entry.Id;
  }): Promise<unknown>;
}

export const deleteCalendarEntryServiceFactory = (
  calendarEntryService: ICalendarEntryService): IDeleteCalendarEntryService => {
  return async ({ calendarEntryId }) => {
    const queried = await calendarEntryService.findCalendarEntryById(calendarEntryId).catch(httpErrors.calendarEntry.getById({
      calendarEntryId,
    }));

    httpErrors.calendarEntry.alreadyResolved(queried);

    return calendarEntryService.deleteCalendarEntry(calendarEntryId).catch(httpErrors.calendarEntry.delete({
      calendarEntryId,
    }));
  };
};
