import { DataFactoryFunction } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';
import { faker } from '@faker-js/faker';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { CalendarDayType } from '@household/shared/enums';
import { addSeconds, dateToISODateString } from '@household/shared/common/utils';

export const calendarDayDataFactory = (() => {
  const createPastCalendarDay = () => {
    return dateToISODateString(faker.date.recent({
      days: 50,
    }));
  };

  const createFutureCalendarDay = () => {
    return dateToISODateString(faker.date.soon({
      days: 50,
    }));
  };
  const createCalendarWorkdayRequest: DataFactoryFunction<Calendar.Day.WorkdayRequest> = (req) => {
    const start = faker.number.int({
      min: WORKDAY_START,
      max: WORKDAY_END - 1,
    });

    return {
      dayType: CalendarDayType.Workday,
      start,
      end: faker.number.int({
        min: start + 1,
        max: WORKDAY_END,
      }),
      ...req,
    };
  };

  const createCalendarVacationRequest: DataFactoryFunction<Calendar.Day.VacationRequest> = (req) => {
    return {
      dayType: CalendarDayType.Vacation,
      ...req,
    };
  };

  const createCalendarDayDocument = (ctx?: {
    body?: Partial<Calendar.Day.Request>;
  } & Partial<Calendar.DayProp>): Calendar.Day.Document => {
    const day = ctx?.day ?? createFutureCalendarDay();
    const expiresAt = addSeconds(Cypress.env('EXPIRES_IN'));

    if (ctx?.body?.dayType === CalendarDayType.Vacation) {
      return {
        day,
        ...createCalendarVacationRequest(ctx?.body),
        expiresAt,  
        end: undefined,
        start: undefined,
      };
    }

    return {
      day,
      ...createCalendarWorkdayRequest(ctx?.body),
      expiresAt,
    };
  };

  return {
    workdayRequest: createCalendarWorkdayRequest,
    vacationRequest: createCalendarVacationRequest,
    pastDay: createPastCalendarDay,
    futureDay: createFutureCalendarDay,
    document: createCalendarDayDocument,
  };
})();
