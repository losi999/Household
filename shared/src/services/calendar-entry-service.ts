import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Calendar, Transaction } from '@household/shared/types/types';

export interface ICalendarEntryService {
  // dumpCalendarEntries(): Promise<CalendarEntry.Document[]>;
  saveCalendarEntry(doc: Calendar.Entry.Document): Promise<Calendar.Entry.Document>;
  // saveCalendarEntries(docs: CalendarEntry.Document[]): Promise<unknown>;
  findCalendarEntryById(calendarEntryId: Calendar.Entry.Id): Promise<Calendar.Entry.Document>;
  getCalendarEntryById(calendarEntryId: Calendar.Entry.Id): Promise<Calendar.Entry.Document>;
  deleteCalendarEntry(calendarEntryId: Calendar.Entry.Id): Promise<unknown>;
  updateCalendarEntry(calendarEntryId: Calendar.Entry.Id, updateQuery: DocumentUpdate<Calendar.Entry.Document>): Promise<unknown>;
  updateCalendarEntryWithPayment(calendarEntryId: Calendar.Entry.Id, transactionDocument: Transaction.PaymentDocument): Promise<Transaction.Document>;
  listCalendarEntries(data: Calendar.DateRange): Promise<Calendar.Entry.Document[]>;
  // findCalendarEntriesByIds(calendarEntryIds: CalendarEntry.Id[]): Promise<CalendarEntry.Document[]>;
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
    findCalendarEntryById: async (calendarEntryId) => {
      return !calendarEntryId ? undefined : mongodbService.calendarEntries.findById(calendarEntryId)
        .lean();        
    },
    getCalendarEntryById: (calendarEntryId) => {
      return !calendarEntryId ? undefined : mongodbService.inSession(async(session) => {
        return mongodbService.calendarEntries.findById(calendarEntryId).session(session)
          .populate('customer')
          .populate('prices.price')
          .populate('transaction')
          .lean();          
      });
    },
    deleteCalendarEntry: async (calendarEntryId) => {
      return mongodbService.inSession((session) => {
        return mongodbService.calendarEntries.findByIdAndDelete(calendarEntryId, {
          session,
        });          
      });
    },
    updateCalendarEntry: async (calendarEntryId, { update }) => {
      return mongodbService.calendarEntries.findByIdAndUpdate(calendarEntryId, update, {
        runValidators: true,
      });
    },
    updateCalendarEntryWithPayment: async (calendarEntryId, transactionDocument) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          const [transaction] = await mongodbService.transactions.create([transactionDocument], {
            session,
          });

          await mongodbService.calendarEntries.findByIdAndUpdate(calendarEntryId, {
            isPaid: true,
            transaction,
          });

          return transaction;
        });
      });
    },
    listCalendarEntries: ({ dateFrom, dateTo }) => {
      return mongodbService.inSession(async(session) => {
        return mongodbService.calendarEntries.find({
          day: {
            $gte: dateFrom,
            $lte: dateTo,
          },
        }).session(session)
          .populate('customer')
          .populate('prices.price')
          .populate('transaction')
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
    // findCalendarEntriesByIds: (calendarEntryIds) => {
    //   return mongodbService.inSession(async (session) => {
    //     return mongodbService.calendarEntries.find({
    //       _id: {
    //         $in: calendarEntryIds,
    //       },
    //     }).session(session)
    //       .lean();
          
    //   });
    // },
  };

  return instance;
};
