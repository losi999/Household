import { generateMongoId, getCalendarEntryId } from '@household/shared/common/utils';
import { addSeconds } from '@household/shared/common/utils';
import { DocumentUpdate } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';

export interface ICalendarEntryDocumentConverter {
  create(body: Calendar.Entry.Request, expiresIn: number, generateId?: boolean): Calendar.Entry.Document;
  update(body: Calendar.Entry.Request, expiresIn: number): DocumentUpdate<Calendar.Entry.Document>;
  toResponse(doc: Calendar.Entry.Document): Calendar.Entry.Response;
  toResponseList(docs: Calendar.Entry.Document[]): Calendar.Entry.Response[];
}

export const calendarEntryDocumentConverterFactory = (): ICalendarEntryDocumentConverter => {
  const instance: ICalendarEntryDocumentConverter = {
    create: ({ day, end, start, title, entryType: type, description }, expiresIn, generateId) => {
      return {
        title,
        entryType: type,
        start,
        end,
        description,
        day,
        _id: generateId ? generateMongoId() : undefined,
        expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
      };
    },
    update: (body, expiresIn) => {
      return {
        update: {
          $set: {
            ...body,
            expiresAt: expiresIn ? addSeconds(expiresIn) : undefined,
          },
          ...(!body.description ? {
            $unset: {
              description: true,
            },
          } : {}),
        },
      };
    },
    // toDateRangeResponse: ({ dateFrom, dateTo }, entries) => {
    //   const days: CalendarEntry.Response[] = [];

    //   for(let d = new Date(dateFrom); d <= new Date(dateTo); d.setDate(d.getDate() + 1)) {
    //     const day = d.toISOString();
    //     console.log(d);

    //     const entriesForDay = entries.filter(e => e.day.toISOString() === day);
    //     const workEntries = entriesForDay.filter(e => e.entryType === CalendarEntryType.Work);
        
    //     const { start, end } = workEntries.reduce<{start: number; end: number}>((accumulator, currentValue) => {
    //       const calculatedStart = currentValue.end - WORKDAY_LENGTH * 4 - 1;
    //       const calculatedend = currentValue.start + WORKDAY_START * 4;
    //       return {
    //         start: calculatedStart > accumulator.start ? calculatedStart : accumulator.start,
    //         end: calculatedend < accumulator.end ? calculatedend : accumulator.end,
    //       };
    //     }, {
    //       start: WORKDAY_START * 4,
    //       end: WORKDAY_END * 4 + 1,
    //     });

    //     days.push({
    //       day: day.split('T')[0],
    //       start,
    //       end,
    //       entries: instance.toEntryResponseList(entriesForDay),
    //       dayType: [
    //         0,
    //         6,
    //       ].includes(d.getDay()) ? 'weekend' : 'workday',
    //     });
    //   }

    //   return days;
    // },
    toResponse: ({ end, start, title, entryType: type, description, _id }) => {
      return {
        calendarEntryId: getCalendarEntryId(_id),
        end, 
        start, 
        title, 
        entryType: type,
        description,
      };
    },
    toResponseList: docs => docs.map(d => instance.toResponse(d)),
  };

  return instance;
};
