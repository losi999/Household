import { Calendar, Customer } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
// import { calendarApiActions } from '@household/web/app/hairdressing/calendar/state/calendar.actions';
import { CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { calculateWorkdayLimits } from '@household/shared/common/utils';
import { LimitedCalendarDay } from '@hairdressing/types';
import { calendarApiActions } from '@hairdressing/state/calendar/calendar-actions';

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

export type CalendarState = {
  [date: string]: LimitedCalendarDay;
};

export const calendarReducer = createReducer<CalendarState>({},
  on(calendarApiActions.listCalendarDaysCompleted, (_state, { days }) => {
    return {
      ..._state,    
      ...days.reduce<CalendarState>((accumulator, currentValue) => {
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
    };
  }),

  on(calendarApiActions.updateCalendarDayCompleted, (_state, { type, day, ...request }) => {
    const storedDay = _state[day];
    if (request.dayType === CalendarDayType.Vacation) {
      return {
        ..._state,
        [day]: {
          dayType: CalendarDayType.Vacation,
          day,
          entries: storedDay.entries,
          calculatedEnd: undefined,
          calculatedStart: undefined,
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
      ..._state,
      [day]: {
        ...newDay,
        calculatedStart: start,
        calculatedEnd: end,
      },
    };
  }),

  on(calendarApiActions.deleteCalendarDayCompleted, (_state, { day }) => {
    const storedDay = _state[day];
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
          ..._state,
          [day]: {
            ...newDay,
            calculatedStart: start,
            calculatedEnd: end,
          },
        };
      }
      case CalendarDayType.Weekend: {
        return {
          ..._state,
          [day]: {
            ...storedDay,
            start: undefined,
            end: undefined,
            calculatedStart: undefined,
            calculatedEnd: undefined,
          },
        };
      }
    }

    return _state;
  }),

  on(calendarApiActions.createCalendarEntryCompleted, (_state, { type, calendarEntryId, customer, ...request }) => { 
    const newDay: LimitedCalendarDay = {
      ..._state[request.day],
      entries: _state[request.day].entries.concat(createCalendarEntryResponseFromRequest(calendarEntryId, request, customer))
        .toSorted((a, b) => a.start > b.start ? 1 : -1),
    };

    const { start, end } = calculateWorkdayLimits(newDay);

    return {
      ..._state,
      [request.day]: {
        ...newDay,
        calculatedStart: start,
        calculatedEnd: end,
      },
    };
  }),

  // on(calendarApiActions.updateCalendarEntryCompleted, (_state, { type, calendarEntryId, customer, ...request }) => {
  //   return Object.entries(_state).reduce<CalendarState>((accumulator, [
  //     date,
  //     dayResponse,
  //   ]) => {
  //     const index = dayResponse.entries.findIndex(e => e.calendarEntryId === calendarEntryId);

  //     let isAffectedDay = false;
  //     let entries = dayResponse.entries;
  //     if (index >= 0) {
  //       entries = entries.toSpliced(index, 1);
  //       isAffectedDay = true;
  //     }

  //     if (date === request.day) {
  //       entries = entries.concat(createCalendarEntryResponseFromRequest(calendarEntryId, request, customer)).toSorted((a, b) => a.start > b.start ? 1 : -1);
  //       isAffectedDay = true;
  //     }

  //     if (!isAffectedDay) {
  //       return {
  //         ...accumulator,
  //         [date]: dayResponse,
  //       };
  //     }

  //     const newDay: LimitedCalendarDay = {
  //       ...dayResponse,
  //       entries,
  //     };

  //     const { start, end } = calculateWorkdayLimits(newDay);

  //     return {
  //       ...accumulator,
  //       [date]: {
  //         ...newDay,
  //         calculatedStart: start,
  //         calculatedEnd: end,
  //       },
  //     };
  //   }, {});
  // }),

  on(calendarApiActions.deleteCalendarEntryCompleted, (_state, { calendarEntryId }) => {
    return Object.entries(_state).reduce<CalendarState>((accumulator, [
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
    }, {});
  }),

  on(calendarApiActions.resolveCalendarWorkEntryCompleted, (_state, { type, calendarEntryId, day, ...request }) => {
    return {
      ..._state,
      [day]: {
        ..._state[day],
        entries: _state[day].entries.map(e => {
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
    };
  }),
);
