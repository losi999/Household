import { Calendar, Customer } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { calendarApiActions } from '@household/web/app/hairdressing/calendar/state/calendar.actions';
import { CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { WORKDAY_END, WORKDAY_LENGTH, WORKDAY_START } from '@household/shared/constants';

const calculateWorkdayLimits = (day: Calendar.Day.Response): Calendar.TimeInterval => {
  if (day.dayType === CalendarDayType.Holiday || day.dayType === CalendarDayType.Vacation || !day.start || !day.end) {
    return {
      start: undefined,
      end: undefined,
    };
  }

  const workEntries = day.entries.filter(e => e.entryType === CalendarEntryType.Work);
  if (workEntries.length === 0) {
    return {
      start: day.start,
      end: day.end,
    };
  }

  const { start: earliestStart, end: latestEnd } = workEntries.reduce<Calendar.TimeInterval>((accumulator, currentValue) => {
    return {
      start: currentValue.start < accumulator.start ? currentValue.start : accumulator.start,
      end: currentValue.end > accumulator.end ? currentValue.end : accumulator.end,
    };
  }, {
    start: Number.POSITIVE_INFINITY,
    end: Number.NEGATIVE_INFINITY,
  });

  const calculatedStart = latestEnd - WORKDAY_LENGTH;
  const calculatedEnd = earliestStart + WORKDAY_LENGTH;

  const start = Math.max(calculatedStart, day.start);
  const end = Math.min(calculatedEnd, day.end);

  if (start <= end) {
    return {
      start,
      end,
    };
  }

  return {
    start: undefined,
    end: undefined,
  };
};

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
  [date: string]: Calendar.Day.Response & {calculatedStart: number; calculatedEnd: number;};
};

export const calendarReducer = createReducer<CalendarState>({},
  on(calendarApiActions.listCalendarDaysCompleted, (_state, { entries }) => {
    return {
      ..._state,    
      ...entries.reduce<CalendarState>((accumulator, currentValue) => {
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
    let newDay: Calendar.Day.Response;
    if (request.dayType === CalendarDayType.Vacation) {
      newDay = {
        ...storedDay,
        dayType: CalendarDayType.Vacation,
      };
    } else {
      newDay = {
        ...storedDay,
        dayType: storedDay.dayType === CalendarDayType.Weekend ? CalendarDayType.Weekend : CalendarDayType.Workday,
        start: request.start,
        end: request.end,
      };
    }

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
    let newDay: Calendar.Day.Response;
    switch(storedDay.dayType) {
      case CalendarDayType.Vacation: {
        newDay = {
          ...storedDay,
          dayType: CalendarDayType.Workday,
          end: WORKDAY_END,
          start: WORKDAY_START,
        };
      } break;
      case CalendarDayType.Workday: {
        newDay = {
          ...storedDay,
          dayType: CalendarDayType.Workday,
          end: WORKDAY_END,
          start: WORKDAY_START,
        };
      } break;
      case CalendarDayType.Weekend: {
        newDay = {
          ...storedDay,
          start: undefined,
          end: undefined,
        };
      } break;
    }

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

  on(calendarApiActions.createCalendarEntryCompleted, (_state, { type, calendarEntryId, customer, ...request }) => { 
    const newDay: Calendar.Day.Response = {
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

  on(calendarApiActions.updateCalendarEntryCompleted, (_state, { type, calendarEntryId, customer, ...request }) => {
    return Object.entries(_state).reduce<CalendarState>((accumulator, [
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

      const newDay: Calendar.Day.Response = {
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
    }, {});
  }),

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

      const newDay: Calendar.Day.Response = {
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
