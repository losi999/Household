import { addSeconds } from '@household/shared/common/utils';
import { WORKDAY_LENGTH, WORKDAY_START, WORKDAY_END } from '@household/shared/constants';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
import { DocumentUpdate } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';

export interface ICalendarDayDocumentConverter {
  update(body: Calendar.Day.Request, expiresIn: number): DocumentUpdate<Calendar.Day.Document>;
  toResponse(data: Calendar.DateRange & {entries: Calendar.Entry.Document[]; days: Calendar.Day.Document[]}): Calendar.Day.Response[];
}

export const calendarDayDocumentConverterFactory = (calendarEntryDocumentConverter: ICalendarEntryDocumentConverter): ICalendarDayDocumentConverter => {
  const getDateRangeArray = ({ dateFrom, dateTo }: Calendar.DateRange) => {
    const end = new Date(dateTo);
    const dates = [];

    const current = new Date(dateFrom);
    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const calculateWorkdayLimits = (defaultStart: number, defaultEnd: number, entries: Calendar.Entry.Document[]): {start: number; end: number;} => {
    const workEntries = entries.filter(e => e.entryType === CalendarEntryType.Work);

    return workEntries.reduce<{start: number; end: number}>((accumulator, currentValue) => {
      const calculatedStart = currentValue.end - WORKDAY_LENGTH * 4 - 1;
      const calculatedend = currentValue.start + WORKDAY_LENGTH * 4;
      return {
        start: calculatedStart > accumulator.start ? calculatedStart : accumulator.start,
        end: calculatedend < accumulator.end ? calculatedend : accumulator.end,
      };
    }, {
      start: defaultStart,
      end: defaultEnd,
    });
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
        const day = days.find(x => x.day === date);
        const entriesForDay = entries.filter(e => e.day === date);

        if (day?.dayType === CalendarDayType.Vacation || day?.dayType === CalendarDayType.Holiday) {
          return {
            dayType: day.dayType,
            day: date,
            entries: calendarEntryDocumentConverter.toResponseList(entriesForDay),
          };
        }

        if (day?.dayType === CalendarDayType.Workday) {
          const { start, end } = calculateWorkdayLimits(day.start, day.end, entriesForDay);

          return {
            day: date,
            dayType: CalendarDayType.Workday,
            end,
            start,
            entries: calendarEntryDocumentConverter.toResponseList(entriesForDay),
          };
        }

        if ([
          0,
          6,
        ].includes(new Date(date).getDay())) {
          return {
            day: date,
            dayType: CalendarDayType.Weekend,
            entries: calendarEntryDocumentConverter.toResponseList(entriesForDay),
          };
        }
        const { start, end } = calculateWorkdayLimits(WORKDAY_START * 4, WORKDAY_END * 4 + 1, entriesForDay);

        return {
          day: date,
          dayType: CalendarDayType.Workday,
          end,
          start,
          entries: calendarEntryDocumentConverter.toResponseList(entriesForDay),
        };
      });

      return response;
    },
  };

  return instance;
};
