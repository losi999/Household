import { httpErrors } from '@household/api/common/error-handlers';
import { ICalendarDayService } from '@household/shared/services/calendar-day-service';
import { Calendar } from '@household/shared/types/types';

export interface IDeleteCalendarDayService {
  (ctx: Calendar.DayProp): Promise<unknown>;
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
