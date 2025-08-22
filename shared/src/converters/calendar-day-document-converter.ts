import { addSeconds, dateToISODateString } from '@household/shared/common/utils';
import { WORKDAY_START, WORKDAY_END, WORKDAY_LENGTH } from '@household/shared/constants';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
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

  const calculateWorkdayLimits = (defaultStart: number, defaultEnd: number, entries: Calendar.Entry.Response[]): {start: number; end: number;} => {
    const workEntries = entries.filter(e => e.entryType === CalendarEntryType.Work);

    return workEntries.reduce<{start: number; end: number}>((accumulator, currentValue) => {
      const calculatedStart = currentValue.end - WORKDAY_LENGTH;
      const calculatedend = currentValue.start + WORKDAY_LENGTH;
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
        const isWeekend = [
          0,
          6,
        ].includes(date.getDay());
        const dateString = dateToISODateString(date);
        const day = days.find(x => x.day === dateString);
        const entriesForDay = calendarEntryDocumentConverter.toResponseList(entries.filter(e => e.day === dateString));

        if (day?.dayType === CalendarDayType.Vacation || day?.dayType === CalendarDayType.Holiday) {
          return {
            dayType: day.dayType,
            day: dateString,
            entries: entriesForDay,
          };
        }

        if (day?.dayType === CalendarDayType.Workday) {
          const { start, end } = calculateWorkdayLimits(day.start, day.end, entriesForDay);
          return {
            day: dateString,
            dayType: isWeekend ? CalendarDayType.Weekend : CalendarDayType.Workday,
            end,
            start,
            entries: entriesForDay,
            plannedEnd: day.end,
            plannedStart: day.start,
          };
        }

        if (isWeekend) {
          return {
            day: dateString,
            dayType: CalendarDayType.Weekend,
            entries: entriesForDay,
            start: undefined,
            end: undefined,
            plannedEnd: undefined,
            plannedStart: undefined,
          };
        }
        const { start, end } = calculateWorkdayLimits(WORKDAY_START, WORKDAY_END, entriesForDay);

        return {
          day: dateString,
          dayType: CalendarDayType.Workday,
          end,
          start,
          entries: entriesForDay,
          plannedEnd: WORKDAY_END,
          plannedStart: WORKDAY_START,
        };
      });

      return response;
    },
  };

  return instance;
};
