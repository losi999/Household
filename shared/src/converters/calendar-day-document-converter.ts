import { addSeconds, dateToISODateString } from '@household/shared/common/utils';
import { WORKDAY_START, WORKDAY_END } from '@household/shared/constants';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { CalendarDayType } from '@household/shared/enums';
import { DocumentUpdate } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';

export interface ICalendarDayDocumentConverter {
  update(body: Calendar.Day.Request, expiresIn: number): DocumentUpdate<Calendar.Day.Document>;
  toResponse(data: Calendar.DateRange & {entries: Calendar.Entry.Document[]; days: Calendar.Day.Document[]}): Calendar.Day.Response[];
}

export const calendarDayDocumentConverterFactory = (calendarEntryDocumentConverter: ICalendarEntryDocumentConverter): ICalendarDayDocumentConverter => {
  const getDateRangeArray = ({ dateFrom, dateTo }: Calendar.DateRange): Date[] => {
    const end = new Date(dateTo);
    const dates = [];

    const current = new Date(dateFrom);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const instance: ICalendarDayDocumentConverter = {
    update: (body, expiresIn) => {
      return {
        update: {
          $set: {
            ...body,
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
          },
          ...(body.dayType !== CalendarDayType.Workday ? {
            $unset: {
              start: true,
              end: true,
            },
          } : {}),
        },
      };
    },
    toResponse: ({ dateFrom, dateTo, entries, days }) => {
      const response = getDateRangeArray({
        dateFrom,
        dateTo,
      }).map<Calendar.Day.Response>(date => {
        const isWeekend = [
          0,
          6,
        ].includes(date.getDay());
        const dateString = dateToISODateString(date);
        const day = days.find(x => x.day === dateString);
        const entriesForDay = entries.filter(e => e.day === dateString);

        if (day?.dayType === CalendarDayType.Vacation || day?.dayType === CalendarDayType.Holiday) {
          return {
            dayType: day.dayType,
            day: dateString,
            entries: calendarEntryDocumentConverter.toResponseList(entriesForDay),
          };
        }

        if (day?.dayType === CalendarDayType.Workday) {
          return {
            day: dateString,
            dayType: isWeekend ? CalendarDayType.Weekend : CalendarDayType.Workday,
            entries: calendarEntryDocumentConverter.toResponseList(entriesForDay),
            start: day.start,
            end: day.end,
          };
        }

        if (isWeekend) {
          return {
            day: dateString,
            dayType: CalendarDayType.Weekend,
            entries: calendarEntryDocumentConverter.toResponseList(entriesForDay),
            start: undefined,
            end: undefined,
          };
        }

        return {
          day: dateString,
          dayType: CalendarDayType.Workday,
          entries: calendarEntryDocumentConverter.toResponseList(entriesForDay),
          end: WORKDAY_END,
          start: WORKDAY_START,
        };
      });

      return response;
    },
  };

  return instance;
};
