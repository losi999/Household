import { CalendarDayType } from '@household/shared/enums';
import { ICalendarDayService } from '@household/shared/services/calendar-day-service';
import { Calendar } from '@household/shared/types/types';
import { fetch } from 'undici';

export interface IStorePublicHolidaysService {
  (): Promise<unknown>;
}

export const storePublicHolidaysServiceFactory = (calendarDayService: ICalendarDayService): IStorePublicHolidaysService => {
  
  return async () => {
    const calendarDays = (await Promise.all(Array.from({
      length: 10,
    }, (_, index) => 2026 + index)
      .flatMap(async (year) => {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/hu`);
        const body = (await response.json()) as ({
          date: string
        })[];    

        return body.map<Calendar.Day.Document>(({ date }) => {
          return {
            day: date,
            dayType: CalendarDayType.Holiday,
            start: undefined,
            end: undefined,
            expiresAt: undefined,
          };
        });
      }))).flat();

    console.log('days', JSON.stringify(calendarDays));

    return calendarDayService.saveCalendarDays(calendarDays);
  };
};
