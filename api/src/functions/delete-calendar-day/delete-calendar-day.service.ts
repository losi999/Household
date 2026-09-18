import { httpErrors } from '@household/api/common/error-handlers';
import { ICalendarDayService } from '@household/shared/services/calendar-day-service';
import { Api } from '@household/shared/types/api';

export interface IDeleteCalendarDayService {
  (ctx: Api.Calendar.Day): Promise<unknown>;
}

export const deleteCalendarDayServiceFactory = (
  calendarDayService: ICalendarDayService): IDeleteCalendarDayService => {
  return async ({ day }) => {
    const queried = await calendarDayService.findCalendarDayByDay(day).catch(httpErrors.calendarDay.getById({
      day,
    }));

    httpErrors.calendarDay.isHoliday(queried);

    return calendarDayService.deleteCalendarDay(day).catch(httpErrors.calendarDay.delete({
      day,
    }));
  };
};
