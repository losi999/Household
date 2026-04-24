import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';

export interface ICalendarDayService {
  findCalendarDayByDay(day: Calendar.DayProp['day']): Promise<Calendar.Day.Document>;
  saveCalendarDay(document: Calendar.Day.Document): Promise<Calendar.Day.Document>;
  deleteCalendarDay(day: Calendar.DayProp['day']): Promise<unknown>;
  updateCalendarDay(day: Calendar.DayProp['day'], updateQuery: DocumentUpdate<Calendar.Day.Document>): Promise<unknown>;
  listCalendarDays(data: Calendar.DateRange): Promise<Calendar.Day.Document[]>;
  clearCalendarDay(day: Calendar.DayProp['day']): Promise<unknown>;
}

export const calendarDayServiceFactory = (mongodbService: IMongodbService): ICalendarDayService => {

  const instance: ICalendarDayService = {
    saveCalendarDay: (doc) => {
      return mongodbService.calendarDays((model, session) => {
        return model.findOneAndReplace({
          day: doc.day,
        }, doc, {
          upsert: true,
          session,
        });
      });
    },
    findCalendarDayByDay: async(day) => {
      if (day) {
        return mongodbService.calendarDays((model, session) => {
          return model.findOne({
            day,
          })
            .session(session)
            .lean();
        });
      }
    },
    deleteCalendarDay: async (day) => {
      return mongodbService.calendarDays((model, session) => {
        return model.deleteOne({
          day,
        }, {
          session,
        });
      });
    },
    clearCalendarDay: async (day) => {
      return mongodbService.inTransaction(async (models, session) => {
        await models.calendarDays.deleteMany({
          day,
        }, {
          session,
        });

        await models.calendarEntries.deleteMany({
          day,
        }, {
          session,
        });
      });
    },
    updateCalendarDay: async (day, { update }) => {
      return mongodbService.calendarDays((model, session) => {
        return model.findOneAndUpdate({
          day,
        }, update, {
          runValidators: true,
          upsert: true,
          session,
        });
      });
    },
    listCalendarDays: ({ dateFrom, dateTo }) => {
      return mongodbService.calendarDays((model, session) => {
        return model.find({
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
  };

  return instance;
};
