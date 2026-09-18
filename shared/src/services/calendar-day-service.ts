import { IMongodbService } from '@household/shared/services/mongodb-service';
import { Api } from '@household/shared/types/api';
import { DocumentUpdate } from '@household/shared/types/common';
import { Documents } from '@household/shared/types/documents';

export interface ICalendarDayService {
  findCalendarDayByDay(day: Api.Calendar.Day['day']): Promise<Documents.CalendarDay>;
  saveCalendarDays(documents: Documents.CalendarDay[]): Promise<unknown>;
  saveCalendarDay(document: Documents.CalendarDay): Promise<Documents.CalendarDay>;
  deleteCalendarDay(day: Api.Calendar.Day['day']): Promise<unknown>;
  updateCalendarDay(day: Api.Calendar.Day['day'], updateQuery: DocumentUpdate<Documents.CalendarDay>): Promise<unknown>;
  listCalendarDays(data: Api.Calendar.DateRange): Promise<Documents.CalendarDay[]>;
  clearCalendarDay(day: Api.Calendar.Day['day']): Promise<unknown>;
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
    saveCalendarDays: (docs) => {
      return mongodbService.inTransaction(({ calendarDays }, session) => {
        return Promise.all(docs.map(d => {
          return calendarDays.findOneAndReplace({
            day: d.day,
          }, d, {
            upsert: true,
            session,
          });
        }));
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
