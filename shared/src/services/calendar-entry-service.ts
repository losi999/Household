import { getCustomerId } from '@household/shared/common/utils';
import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Api } from '@household/shared/types/api';
import { DocumentUpdate } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';
import { PopulateOptions } from 'mongoose';

export interface ICalendarEntryService {
  saveCalendarEntry(doc: Documents.CalendarEntry): Promise<Documents.CalendarEntry>;
  findCalendarEntryById(calendarEntryId: Api.Calendar.Entry.Id): Promise<Documents.CalendarEntry>;
  getCalendarEntryById(calendarEntryId: Api.Calendar.Entry.Id): Promise<Documents.CalendarEntry>;
  deleteCalendarEntry(calendarEntryId: Api.Calendar.Entry.Id): Promise<unknown>;
  updateCalendarEntry(calendarEntryId: Api.Calendar.Entry.Id, updateQuery: DocumentUpdate<Documents.CalendarEntry>): Promise<unknown>;
  updateCalendarEntryWithPayment(calendarEntryId: Api.Calendar.Entry.Id, updateQuery: DocumentUpdate<Documents.CalendarEntry>): Promise<Documents.Transaction>;
  listCalendarEntries(data: Api.Calendar.DateRange): Promise<Documents.CalendarEntry[]>;
  listCalendarWorkEntriesByCustomerId(customerId: Api.Customer.Id): Promise<Documents.CalendarEntry[]>;
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
      return mongodbService.inTransaction(async ({ calendarEntries, customers }, session) => {
        const [entry] = await calendarEntries.create([doc], {
          session,
        });

        if (doc.customer?.isArchived) {
          await customers.findByIdAndUpdate(getCustomerId(doc.customer), {
            $set: {
              isArchived: false,
            },
          }, {
            session,
          });
        }

        return entry;
      });
    },
    findCalendarEntryById: async (calendarEntryId) => {
      if (calendarEntryId) {
        return mongodbService.calendarEntries((model, session) => {
          return model.findById(calendarEntryId)
            .lean()
            .session(session);        
        });
      }
    },
    getCalendarEntryById: (calendarEntryId) => {
      if (calendarEntryId) {
        return mongodbService.calendarEntries((model, session) => {
          return model.findById(calendarEntryId).session(session)
            .populate(calendarEntryPopulate)
            .lean();          
        });
      }
    },
    deleteCalendarEntry: async (calendarEntryId) => {
      return mongodbService.calendarEntries((model, session) => {
        return model.findByIdAndDelete(calendarEntryId, {
          session,
        });          
      });
    },
    updateCalendarEntry: async (calendarEntryId, { update }) => {
      return mongodbService.calendarEntries((model, session) => {
        return model.findByIdAndUpdate(calendarEntryId, update, {
          runValidators: true,
          session,
        });
      });
    },
    updateCalendarEntryWithPayment: async (calendarEntryId, { update }) => {
      return mongodbService.inTransaction(async ({ transactions, calendarEntries }, session) => {
        const [transaction] = await transactions.create([update.$set.transaction], {
          session,
        });

        await calendarEntries.findByIdAndUpdate(calendarEntryId, update).session(session);

        return transaction;
      });
    },
    listCalendarEntries: ({ dateFrom, dateTo }) => {
      return mongodbService.calendarEntries((model, session) => {
        return model.find({
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
      return mongodbService.calendarEntries((model, session) => {
        return model.find({
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
