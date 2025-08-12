import { IMongodbService } from '@household/shared/services/mongodb-service';
import { CalendarEntry } from '@household/shared/types/types';
import { UpdateQuery } from 'mongoose';

export interface ICalendarEntryService {
  // dumpCalendarEntries(): Promise<CalendarEntry.Document[]>;
  saveCalendarEntry(doc: CalendarEntry.Document): Promise<CalendarEntry.Document>;
  // saveCalendarEntries(docs: CalendarEntry.Document[]): Promise<unknown>;
  // findCalendarEntryById(recipientId: CalendarEntry.Id): Promise<CalendarEntry.Document>;
  // deleteCalendarEntry(recipientId: CalendarEntry.Id): Promise<unknown>;
  // updateCalendarEntry(recipientId: CalendarEntry.Id, updateQuery: UpdateQuery<CalendarEntry.Document>): Promise<unknown>;
  listCalendarEntries(data: CalendarEntry.DateRange): Promise<CalendarEntry.Document[]>;
  // findCalendarEntriesByIds(recipientIds: CalendarEntry.Id[]): Promise<CalendarEntry.Document[]>;
}

export const calendarEntryServiceFactory = (mongodbService: IMongodbService): ICalendarEntryService => {

  const instance: ICalendarEntryService = {
    // dumpCalendarEntries: () => {
    //   return mongodbService.inSession(async(session) => {
    //     return mongodbService.calendarEntries.find({}).session(session)
    //       .lean();
          
    //   });
    // },
    saveCalendarEntry: async (doc) => {
      return mongodbService.calendarEntries.create(doc);
    },
    // saveCalendarEntries: (docs) => {
    //   return mongodbService.inSession((session) => {
    //     return session.withTransaction(() => {
    //       return mongodbService.calendarEntries.insertMany(docs, {
    //         session,
    //       });
    //     });
    //   });
    // },
    // findCalendarEntryById: async (recipientId) => {
    //   return !recipientId ? undefined : mongodbService.calendarEntries.findById(recipientId)
    //     .lean();
        
    // },
    // deleteCalendarEntry: async (recipientId) => {
    //   return mongodbService.inSession((session) => {
    //     return session.withTransaction(async () => {
    //       await mongodbService.calendarEntries.deleteOne({
    //         _id: recipientId,
    //       }, {
    //         session,
    //       });
            
    //       await mongodbService.transactions.updateMany({
    //         recipient: recipientId,
    //       }, {
    //         $unset: {
    //           recipient: 1,
    //         },
    //       }, {
    //         session,
    //       });
            
    //     });
    //   });
    // },
    // updateCalendarEntry: async (recipientId, updateQuery) => {
    //   return mongodbService.calendarEntries.findByIdAndUpdate(recipientId, updateQuery, {
    //     runValidators: true,
    //   });
    // },
    listCalendarEntries: ({ dateFrom, dateTo }) => {
      return mongodbService.inSession(async(session) => {
        return mongodbService.calendarEntries.find({
          day: {
            $gte: new Date(dateFrom),
            $lte: new Date(dateTo),
          },
        }).session(session)
          .collation({
            locale: 'hu',
          })
          .sort({
            day: 1,
            start: 1,
          })
          .lean();
          
      });
    },
    // findCalendarEntriesByIds: (recipientIds) => {
    //   return mongodbService.inSession(async (session) => {
    //     return mongodbService.calendarEntries.find({
    //       _id: {
    //         $in: recipientIds,
    //       },
    //     }).session(session)
    //       .lean();
          
    //   });
    // },
  };

  return instance;
};
