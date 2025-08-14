import { httpErrors } from '@household/api/common/error-handlers';
import { ICalendarDayDocumentConverter } from '@household/shared/converters/calendar-day-document-converter';
import { ICalendarDayService } from '@household/shared/services/calendar-day-service';
import { Calendar } from '@household/shared/types/types';

export interface IUpdateCalendarDayService {
  (ctx: {
    body: Calendar.Day.Request;
    expiresIn: number;
  } & Calendar.DayProp): Promise<unknown>;
}

export const updateCalendarDayServiceFactory = (
  calendarDayService: ICalendarDayService,
  calendarDayDocumentConverter: ICalendarDayDocumentConverter,
): IUpdateCalendarDayService => {
  return async ({ body, day, expiresIn }) => {
    const update = calendarDayDocumentConverter.update(body, expiresIn);

    return calendarDayService.updateCalendarDay(day, update).catch(httpErrors.calendarDay.update({
      day,
      update,
    }));
  };
};
