import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Calendar, Customer, Transaction } from '@household/shared/types/types';
import { PopulateOptions } from 'mongoose';

export interface ICalendarEntryService {
  saveCalendarEntry(doc: Calendar.Entry.Document): Promise<Calendar.Entry.Document>;
  findCalendarEntryById(calendarEntryId: Calendar.Entry.Id): Promise<Calendar.Entry.Document>;
  getCalendarEntryById(calendarEntryId: Calendar.Entry.Id): Promise<Calendar.Entry.Document>;
  deleteCalendarEntry(calendarEntryId: Calendar.Entry.Id): Promise<unknown>;
  updateCalendarEntry(calendarEntryId: Calendar.Entry.Id, updateQuery: DocumentUpdate<Calendar.Entry.Document>): Promise<unknown>;
  updateCalendarEntryWithPayment(calendarEntryId: Calendar.Entry.Id, updateQuery: DocumentUpdate<Calendar.Entry.Document>): Promise<Transaction.Document>;
  listCalendarEntries(data: Calendar.DateRange): Promise<Calendar.Entry.Document[]>;
  listCalendarWorkEntriesByCustomerId(customerId: Customer.Id): Promise<Calendar.Entry.Document[]>;
}

export const calendarEntryServiceFactory = (mongodbService: IMongodbService): ICalendarEntryService => {

  const calendarEntryPopulate: PopulateOptions[] = [
    {
      path: 'customer',
      populate: [
        'jobs.prices.price',
        'blacklistedCustomers',
      ],
    },
    {
      path: 'prices.price',
    },
    {
      path: 'transaction',
    },
  ];

  const instance: ICalendarEntryService = {
    saveCalendarEntry: async (doc) => {
      const [entry] = await mongodbService.inSession((session) => {
        return mongodbService.calendarEntries.create([doc], {
          session,
        });
      });
      
      return entry;
    },
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
            .populate(calendarEntryPopulate)
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
    updateCalendarEntryWithPayment: async (calendarEntryId, { update }) => {
      return mongodbService.inSession((session) => {
        return session.withTransaction(async () => {
          const [transaction] = await mongodbService.transactions.create([update.$set.transaction], {
            session,
          });

          await mongodbService.calendarEntries.findByIdAndUpdate(calendarEntryId, update).session(session);

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
          .populate(calendarEntryPopulate)
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
          })
          .lean();
      });
    },
  };

  return instance;
};
