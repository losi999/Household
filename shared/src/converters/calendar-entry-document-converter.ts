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
