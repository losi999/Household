import { generateMongoId, getCalendarEntryId } from '@household/shared/common/utils';
import { addSeconds } from '@household/shared/common/utils';
import { WORKDAY_END, WORKDAY_LENGTH, WORKDAY_START } from '@household/shared/constants';
import { CalendarEntryType } from '@household/shared/enums';
import { CalendarEntry } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface ICalendarEntryDocumentConverter {
  create(body: CalendarEntry.Request, expiresIn: number, generateId?: boolean): CalendarEntry.Document;
  // update(body: CalendarEntry.Request, expiresIn: number): UpdateQuery<CalendarEntry.Document>;
  toDateRangeResponse(range: CalendarEntry.DateRange, entries: CalendarEntry.Document[]): CalendarEntry.Response[];
  toEntryResponse(doc: CalendarEntry.Document): CalendarEntry.Response['entries'][number];
  toEntryResponseList(docs: CalendarEntry.Document[]): CalendarEntry.Response['entries'];

  // toReport(doc: CalendarEntry.Document): CalendarEntry.Report;
  // toResponseList(docs: CalendarEntry.Document[]): CalendarEntry.Response[];
}

export const calendarEntryDocumentConverterFactory = (): ICalendarEntryDocumentConverter => {
  const instance: ICalendarEntryDocumentConverter = {
    create: ({ day, end, start, title, type }, expiresIn, generateId) => {
      return {
        title,
        type,
        start,
        end,
        day: new Date(day),
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    // update: (body, expiresIn) => {
    //   return {
    //     $set: {
    //       ...body,
    //       expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
    //     },
    //   };
    // },
    toDateRangeResponse: ({ dateFrom, dateTo }, entries) => {
      const days: CalendarEntry.Response[] = [];

      for(let d = new Date(dateFrom); d <= new Date(dateTo); d.setDate(d.getDate() + 1)) {
        const day = d.toISOString();
        console.log(d);

        const entriesForDay = entries.filter(e => e.day.toISOString() === day);
        const workEntries = entriesForDay.filter(e => e.type === CalendarEntryType.Work);
        
        const { start, end } = workEntries.reduce<{start: number; end: number}>((accumulator, currentValue) => {
          const calculatedStart = currentValue.end - WORKDAY_LENGTH * 4 - 1;
          const calculatedend = currentValue.start + WORKDAY_START * 4;
          return {
            start: calculatedStart > accumulator.start ? calculatedStart : accumulator.start,
            end: calculatedend < accumulator.end ? calculatedend : accumulator.end,
          };
        }, {
          start: WORKDAY_START * 4,
          end: WORKDAY_END * 4 + 1,
        });

        days.push({
          day: day.split('T')[0],
          start,
          end,
          entries: instance.toEntryResponseList(entriesForDay),
          type: [
            0,
            6,
          ].includes(d.getDay()) ? 'weekend' : 'workday',
        });
      }

      return days;
    },
    toEntryResponse: ({ end, start, title, type, _id }) => {
      return {
        calendarEntryId: getCalendarEntryId(_id),
        end, 
        start, 
        title, 
        type,
      };
    },
    toEntryResponseList: docs => docs.map(d => instance.toEntryResponse(d)),
  };

  return instance;
};
