import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';

export interface ICalendarDayService {
  // dumpCalendarEntries(): Promise<CalendarDay.Document[]>;
  // saveCalendarDay(doc: Calendar.Day.Document): Promise<Calendar.Day.Document>;
  // saveCalendarEntries(docs: CalendarDay.Document[]): Promise<unknown>;
  // findCalendarDayById(calendarDayId: Calendar.Day.Id): Promise<Calendar.Day.Document>;
  deleteCalendarDay(day: Calendar.DayProp['day']): Promise<unknown>;
  updateCalendarDay(day: Calendar.DayProp['day'], updateQuery: DocumentUpdate<Calendar.Day.Document>): Promise<unknown>;
  listCalendarDays(data: Calendar.DateRange): Promise<Calendar.Day.Document[]>;
  // findCalendarEntriesByIds(calendarDayIds: CalendarDay.Id[]): Promise<CalendarDay.Document[]>;
}

export const calendarDayServiceFactory = (mongodbService: IMongodbService): ICalendarDayService => {

  const instance: ICalendarDayService = {
    // dumpCalendarEntries: () => {
    //   return mongodbService.inSession(async(session) => {
    //     return mongodbService.calendarEntries.find({}).session(session)
    //       .lean();
          
    //   });
    // },
    // saveCalendarDay: async (doc) => {
    //   return mongodbService.calendarEntries.create(doc);
    // },
    // saveCalendarEntries: (docs) => {
    //   return mongodbService.inSession((session) => {
    //     return session.withTransaction(() => {
    //       return mongodbService.calendarEntries.insertMany(docs, {
    //         session,
    //       });
    //     });
    //   });
    // },
    // findCalendarDayById: async (calendarDayId) => {
    //   return !calendarDayId ? undefined : mongodbService.calendarEntries.findById(calendarDayId)
    //     .lean();        
    // },
    deleteCalendarDay: async (day) => {
      return mongodbService.inSession((session) => {
        return mongodbService.calendarDays.deleteOne({
          day,
        }, {
          session,
        });
      });
    },
    updateCalendarDay: async (day, { update }) => {
      return mongodbService.calendarDays.findOneAndUpdate({
        day,
      }, update, {
        runValidators: true,
        upsert: true,
      });
    },
    listCalendarDays: ({ dateFrom, dateTo }) => {
      return mongodbService.inSession(async(session) => {
        return mongodbService.calendarDays.find({
          day: {
            $gte: dateFrom,
            $lte: dateTo,
          },
        }).session(session)
          .collation({
            locale: 'hu',
          })
          .sort({
            day: 1,
          })
          .lean();
          
      });
    },
    // findCalendarEntriesByIds: (calendarDayIds) => {
    //   return mongodbService.inSession(async (session) => {
    //     return mongodbService.calendarEntries.find({
    //       _id: {
    //         $in: calendarDayIds,
    //       },
    //     }).session(session)
    //       .lean();
          
    //   });
    // },
  };

  return instance;
};
