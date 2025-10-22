import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Calendar, Customer, Transaction } from '@household/shared/types/types';

export interface ICalendarEntryService {
  saveCalendarEntry(doc: Calendar.Entry.Document): Promise<Calendar.Entry.Document>;
  // saveCalendarEntries(docs: CalendarEntry.Document[]): Promise<unknown>;
  findCalendarEntryById(calendarEntryId: Calendar.Entry.Id): Promise<Calendar.Entry.Document>;
  getCalendarEntryById(calendarEntryId: Calendar.Entry.Id): Promise<Calendar.Entry.Document>;
  deleteCalendarEntry(calendarEntryId: Calendar.Entry.Id): Promise<unknown>;
  updateCalendarEntry(calendarEntryId: Calendar.Entry.Id, updateQuery: DocumentUpdate<Calendar.Entry.Document>): Promise<unknown>;
  updateCalendarEntryWithPayment(calendarEntryId: Calendar.Entry.Id, transactionDocument: Transaction.PaymentDocument): Promise<Transaction.Document>;
  listCalendarEntries(data: Calendar.DateRange): Promise<Calendar.Entry.Document[]>;
  listCalendarWorkEntriesByCustomerId(customerId: Customer.Id): Promise<Calendar.Entry.Document[]>;
  // findCalendarEntriesByIds(calendarEntryIds: CalendarEntry.Id[]): Promise<CalendarEntry.Document[]>;
}

export const calendarEntryServiceFactory = (mongodbService: IMongodbService): ICalendarEntryService => {

  const instance: ICalendarEntryService = {
    saveCalendarEntry: async (doc) => {
      const [entry] = await mongodbService.inSession((session) => {
        return mongodbService.calendarEntries.create([doc], {
          session,
        });
      });
      
      return entry;
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
      if (calendarEntryId) {
        return mongodbService.inSession((session) => {
          return mongodbService.calendarEntries.findById(calendarEntryId)
            .lean()
            .session(session);        
        });
      }
    },
    getCalendarEntryById: (calendarEntryId) => {
      if (calendarEntryId) {
        return mongodbService.inSession(async(session) => {
          return mongodbService.calendarEntries.findById(calendarEntryId).session(session)
            .populate('customer')
            .populate('prices.price')
            .populate('transaction')
            .lean();          
        });
      }
    },
    deleteCalendarEntry: async (calendarEntryId) => {
      return mongodbService.inSession((session) => {
        return mongodbService.calendarEntries.findByIdAndDelete(calendarEntryId, {
          session,
        });          
      });
    },
    updateCalendarEntry: async (calendarEntryId, { update }) => {
      return mongodbService.inSession(async(session) => {
        return mongodbService.calendarEntries.findByIdAndUpdate(calendarEntryId, update, {
          runValidators: true,
          session,
        });
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
          }).session(session);

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
    listCalendarWorkEntriesByCustomerId: (customerId) => {
      return mongodbService.inSession((session) => {
        return mongodbService.calendarEntries.find({
          customer: customerId,
        })
          .session(session)
          .sort({
            day: -1,
            start: -1,
          });
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
