// import { testDataFactory } from '@household/shared/common/test-data-factory';
// import { addDays, dateToISODateString } from '@household/shared/common/utils';
// import { selectCalendarDay, selectCalendarWeek } from '@household/web/app/hairdressing/calendar/state/calendar.selector';
// import { LimitedCalendarDay } from '@household/web/types/common';

// describe('Calendar selector', () => {
//   it('Select calendar day should return calendar day', () => {
//     const date = new Date();
//     const dayResponse = testDataFactory.calendar.day.response.vacation();

//     const result = selectCalendarDay(date).projector({
//       [dateToISODateString(date)]: {
//         ...dayResponse,
//         calculatedStart: undefined,
//         calculatedEnd: undefined,
//       },
//     });
//     expect(result).toEqual({
//       ...dayResponse,
//       calculatedStart: undefined,
//       calculatedEnd: undefined,
//     });
      
//   });

//   it('Select calendar week should return calendar week with earliest and latest entries calculated', () => {
//     const weekStart = new Date();
//     const earliestStart = 1;
//     const latestEnd = 95;
            
//     const day8: LimitedCalendarDay = {
//       ...testDataFactory.calendar.day.response.vacation({
//         day: dateToISODateString(addDays(8, weekStart)),
//         entries: [
//           testDataFactory.calendar.entry.response.personal({
//             start: earliestStart - 1,
//             end: latestEnd + 1,
//           }),
//         ],
//       }),
//       calculatedEnd: undefined,
//       calculatedStart: undefined,
//     };

//     const day1: LimitedCalendarDay = {
//       ...testDataFactory.calendar.day.response.vacation({
//         day: dateToISODateString(weekStart),
//         entries: [
//           testDataFactory.calendar.entry.response.personal({
//             start: earliestStart,
//           }),
//         ],
//       }),
//       calculatedEnd: undefined,
//       calculatedStart: undefined,
//     };

//     const day2: LimitedCalendarDay = {
//       ...testDataFactory.calendar.day.response.vacation({
//         day: dateToISODateString(addDays(1, weekStart)),
//         entries: [
//           testDataFactory.calendar.entry.response.personal({
//             end: latestEnd,
//           }),
//         ],
//       }),
//       calculatedEnd: undefined,
//       calculatedStart: undefined,
//     };

//     const result = selectCalendarWeek(weekStart).projector({
//       [day1.day]: day1,
//       [day2.day]: day2,
//       [day8.day]: day8,        
//     });
//     expect(result).toEqual({
//       start: earliestStart,
//       end: latestEnd,
//       days: {
//         [day1.day]: day1,
//         [day2.day]: day2,
//       },
//     });
//   });
// });
