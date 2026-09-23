import { httpErrors } from '@household/api/common/error-handlers';
import { ICalendarDayDocumentConverter } from '@household/shared/converters/calendar-day-document-converter';
import { ICalendarDayService } from '@household/shared/services/calendar-day-service';
import { Api } from '@household/shared/types/api';
import { ExpiresIn } from '@household/shared/types/common';
import { Requests } from '@household/shared/types/requests';

export interface IUpdateCalendarDayService {
  (ctx: {
    body: Requests.CalendarDay;
  } & Api.Calendar.Day & ExpiresIn): Promise<unknown>;
}

export const updateCalendarDayServiceFactory = (
  calendarDayService: ICalendarDayService,
  calendarDayDocumentConverter: ICalendarDayDocumentConverter,
): IUpdateCalendarDayService => {
  return async ({ body, day, expiresIn }) => {
    const queried = await calendarDayService.findCalendarDayByDay(day).catch(httpErrors.calendarDay.getById({
      day,
    }));

    httpErrors.calendarDay.isHoliday(queried);

    const update = calendarDayDocumentConverter.update(body, expiresIn);

    return calendarDayService.updateCalendarDay(day, update).catch(httpErrors.calendarDay.update({
      day,
      update,
    }));
  };
};
