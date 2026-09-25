import { addSeconds, dateToISODateString } from '@household/shared/common/utils';
import { ICalendarEntryDocumentConverter } from '@household/shared/converters/calendar-entry-document-converter';
import { CalendarDayType } from '@household/shared/enums';
import { Api } from '@household/shared/types/api';
import { DocumentUpdate } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { Requests } from '@household/shared/types/requests';
import { Responses } from '@household/shared/types/responses';

export interface ICalendarDayDocumentConverter {
  update(body: Requests.CalendarDay, expiresIn: number): DocumentUpdate<Documents.CalendarDay>;
  toResponse(data: Api.Calendar.DateRange & {entries: Documents.CalendarEntry[]; days: Documents.CalendarDay[]}): Responses.CalendarDay[];
}

export const calendarDayDocumentConverterFactory = (calendarEntryDocumentConverter: ICalendarEntryDocumentConverter): ICalendarDayDocumentConverter => {
  const getDateRangeArray = ({ dateFrom, dateTo }: Api.Calendar.DateRange): Date[] => {
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
          ...(body.dayType !== CalendarDayType.Regular ? {
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
      }).map<Responses.CalendarDay>(date => {
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

        return {
          day: dateString,
          dayType: CalendarDayType.Regular,
          entries: calendarEntryDocumentConverter.toResponseList(entriesForDay),
          start: day?.start,
          end: day?.end,
        };
      });

      return response;
    },
  };

  return instance;
};
