import { IMongodbService } from '@household/shared/services/mongodb-service';
import { DocumentUpdate } from '@household/shared/types/common';
import { Calendar } from '@household/shared/types/types';

export interface ICalendarDayService {
  deleteCalendarDay(day: Calendar.DayProp['day']): Promise<unknown>;
  updateCalendarDay(day: Calendar.DayProp['day'], updateQuery: DocumentUpdate<Calendar.Day.Document>): Promise<unknown>;
  listCalendarDays(data: Calendar.DateRange): Promise<Calendar.Day.Document[]>;
}

export const calendarDayServiceFactory = (mongodbService: IMongodbService): ICalendarDayService => {

  const instance: ICalendarDayService = {
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
  };

  return instance;
};
