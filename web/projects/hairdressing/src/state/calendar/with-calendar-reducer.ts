import { calendarApiEvents } from '@hairdressing/state/calendar/calendar-events';
import { CalendarState } from '@hairdressing/state/calendar/calendar-store';
import { LimitedCalendarDay } from '@hairdressing/types';
import { calculateWorkdayLimits } from '@household/shared/common/utils';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { Calendar, Customer } from '@household/shared/types/types';
import { signalStoreFeature } from '@ngrx/signals';
import { on, withReducer } from '@ngrx/signals/events';

export const withCalendarReducer = () => {
  const createCalendarEntryResponseFromRequest = (calendarEntryId: Calendar.Entry.Id, request: Calendar.Entry.Request, customer: Customer.Response): Calendar.Entry.Response => {
    if (request.entryType === CalendarEntryType.Work) {
      return {
        calendarEntryId,
        end: request.end,
        start: request.start,
        title: request.title,
        description: request.description,
        entryType: request.entryType,
        day: request.day,
        additionalPrice: request.additionalPrice,
        prices: customer?.jobs.find(j => request.title.endsWith(j.name))?.prices,
        customer,
        resolution: undefined,
      };
    } 
    return {
      ...request,
      calendarEntryId,
    };
          
  };

  return signalStoreFeature(
    withReducer<CalendarState>(
      on(calendarApiEvents.listCalendarDaysCompleted, ({ payload }) => {
        return (state) => {
          return {
            days: {
              ...state.days,
              ...payload.reduce<CalendarState['days']>((accumulator, currentValue) => {
                const { start, end } = calculateWorkdayLimits(currentValue);
                
                return {
                  ...accumulator,
                  [currentValue.day]: {
                    ...currentValue,
                    calculatedStart: start,
                    calculatedEnd: end,
                  },
                };
              }, {}),
            },
          };
        };
      }),
      on(calendarApiEvents.updateCalendarDayCompleted, ({ payload: { day, ...request } }) => {
        return (state) => {
          const storedDay = state.days[day];
          if (request.dayType === CalendarDayType.Vacation) {
            const newDay: LimitedCalendarDay = {
              dayType: CalendarDayType.Vacation,
              day,
              entries: storedDay.entries,
              calculatedEnd: undefined,
              calculatedStart: undefined,

            };
            return {
              days: {
                ...state.days,
                [day]: newDay,
              },
            };
          } 

          const newDay: LimitedCalendarDay = {
            ...storedDay,
            dayType: storedDay.dayType === CalendarDayType.Weekend ? CalendarDayType.Weekend : CalendarDayType.Workday,
            start: request.start,
            end: request.end,
          };

          const { start, end } = calculateWorkdayLimits(newDay);

          return {
            days: {
              ...state.days,
              [day]: {
                ...newDay,
                calculatedStart: start,
                calculatedEnd: end,
              },
            },
          };
        };
      }),
      on(calendarApiEvents.deleteCalendarDayCompleted, ({ payload: { day } }) => {
        return (state) => {
          const storedDay = state.days[day];
          switch(storedDay.dayType) {
            case CalendarDayType.Vacation: 
            case CalendarDayType.Workday: {
              const newDay: LimitedCalendarDay = {
                ...storedDay,
                dayType: CalendarDayType.Workday,
                end: WORKDAY_END,
                start: WORKDAY_START,
              };
          
              const { start, end } = calculateWorkdayLimits(newDay);
                
              return {
                days: {
                  ...state.days,
                  [day]: {
                    ...newDay,
                    calculatedStart: start,
                    calculatedEnd: end,
                  },
                },
              };
            }
            case CalendarDayType.Weekend: {
              return {
                days: {
                  ...state.days,
                  [day]: {
                    ...storedDay,
                    start: undefined,
                    end: undefined,
                    calculatedStart: undefined,
                    calculatedEnd: undefined,
                  },
                },
              };
            }
          }
          
          return {};
        };
      }),
      on(calendarApiEvents.createCalendarEntryCompleted, ({ payload: { calendarEntryId, customer, ...request } }) => {
        return (state) => {
          const newDay: LimitedCalendarDay = {
            ...state.days[request.day],
            entries: state.days[request.day].entries.concat(createCalendarEntryResponseFromRequest(calendarEntryId, request, customer))
              .toSorted((a, b) => a.start > b.start ? 1 : -1),
          };

          const { start, end } = calculateWorkdayLimits(newDay);

          return {
            days: {
              ...state.days,
              [request.day]: {
                ...newDay,
                calculatedStart: start,
                calculatedEnd: end,
              },
            },
          };
        };
      }),
      on(calendarApiEvents.updateCalendarEntryCompleted, ({ payload: { calendarEntryId, customer, ...request } }) => {
        return (state) => {
          return {
            days: Object.entries(state.days).reduce<CalendarState['days']>((accumulator, [
              date,
              dayResponse,
            ]) => {
              const index = dayResponse.entries.findIndex(e => e.calendarEntryId === calendarEntryId);

              let isAffectedDay = false;
              let entries = dayResponse.entries;
              if (index >= 0) {
                entries = entries.toSpliced(index, 1);
                isAffectedDay = true;
              }

              if (date === request.day) {
                entries = entries.concat(createCalendarEntryResponseFromRequest(calendarEntryId, request, customer)).toSorted((a, b) => a.start > b.start ? 1 : -1);
                isAffectedDay = true;
              }

              if (!isAffectedDay) {
                return {
                  ...accumulator,
                  [date]: dayResponse,
                };
              }

              const newDay: LimitedCalendarDay = {
                ...dayResponse,
                entries,
              };

              const { start, end } = calculateWorkdayLimits(newDay);

              return {
                ...accumulator,
                [date]: {
                  ...newDay,
                  calculatedStart: start,
                  calculatedEnd: end,
                },
              };
            }, {}),
          };
        };
      }),
      on(calendarApiEvents.deleteCalendarEntryCompleted, ({ payload: { calendarEntryId } }) => {
        return (state) => {
          return {
            days: Object.entries(state.days).reduce<CalendarState['days']>((accumulator, [
              date,
              response,
            ]) => {
              const index = response.entries.findIndex(e => e.calendarEntryId === calendarEntryId);
              if (index < 0) {
                return {
                  ...accumulator,
                  [date]: response,
                };
              }

              const newDay: LimitedCalendarDay = {
                ...response,
                entries: response.entries.toSpliced(index, 1),
              };

              const { start, end } = calculateWorkdayLimits(newDay);

              return {
                ...accumulator,
                [date]: {
                  ...newDay,
                  calculatedStart: start,
                  calculatedEnd: end,
                },
              };
            }, {}),
          };
        };
      }),
      on(calendarApiEvents.resolveCalendarWorkEntryCompleted, ({ payload: { calendarEntryId, day, ...request } }) => {
        return (state) => {
          return {
            days: {
              ...state.days,
              [day]: {
                ...state[day],
                entries: state.days[day].entries.map(e => {
                  if (e.calendarEntryId !== calendarEntryId) {
                    return e;
                  }
                  
                  return {
                    ...e,
                    resolution: {
                      status: request.status,
                      delay: request.status !== CalendarEntryResolutionStatus.NoShow ? request.delay : undefined,
                    },
                  };
                }),
              },
            },
          };
        };
      }),
    ),
  );
};
