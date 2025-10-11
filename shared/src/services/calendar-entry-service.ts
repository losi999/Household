import { getCustomerId } from '@household/shared/common/utils';
import { CalendarEntryType } from '@household/shared/enums';
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
  listCalendarWorkEntriesGroupedByCustomer(): Promise<{[customerId: Customer.Id]: Calendar.Entry.Document[]}>;
  // findCalendarEntriesByIds(calendarEntryIds: CalendarEntry.Id[]): Promise<CalendarEntry.Document[]>;
}

export const calendarEntryServiceFactory = (mongodbService: IMongodbService): ICalendarEntryService => {

  const instance: ICalendarEntryService = {
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
          .populate('prices.price');
      });
    },
    listCalendarWorkEntriesGroupedByCustomer: () => {
      return mongodbService.inSession(async (session) => {
        const entries = await mongodbService.calendarEntries.find({
          entryType: CalendarEntryType.Work,
        }).session(session)
          .sort({
            day: -1,
            start: -1,
          })
          .populate('prices.price');

        return entries.reduce<{[customerId: Customer.Id]: Calendar.Entry.Document[]}>((accumulator, currentValue) => {
          const customerId = getCustomerId(currentValue.customer);

          return {
            ...accumulator,
            [customerId]: [
              ...accumulator[customerId] ?? [],
              currentValue,
            ],
          };
        }, {});
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
