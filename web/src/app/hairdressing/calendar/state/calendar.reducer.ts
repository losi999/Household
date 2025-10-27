import { Calendar, Customer } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { calendarApiActions } from '@household/web/app/hairdressing/calendar/state/calendar.actions';
import { CalendarDayType, CalendarEntryResolutionStatus, CalendarEntryType } from '@household/shared/enums';
import { WORKDAY_END, WORKDAY_LENGTH, WORKDAY_START } from '@household/shared/constants';
import { calculateWorkdayLimits } from '@household/shared/common/utils';

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
  [date: string]: Calendar.Day.Response;
};

export const calendarReducer = createReducer<CalendarState>({},
  on(calendarApiActions.listCalendarDaysCompleted, (_state, { entries }) => {
    return {
      ..._state,    
      ...entries.reduce((accumulator, currentValue) => {
        return {
          ...accumulator,
          [currentValue.day]: currentValue,
        };
      }, {}),
    };
  }),

  on(calendarApiActions.updateCalendarDayCompleted, (_state, { type, day, ...request }) => {
    const storedDay = _state[day];
    let newDay: Calendar.Day.Response;
    if (request.dayType === CalendarDayType.Workday) {
      const dayLimits = calculateWorkdayLimits(request.start, request.end, storedDay.entries); // TODO
      newDay = {
        ...storedDay,
        dayType: storedDay.dayType === CalendarDayType.Weekend ? CalendarDayType.Weekend : CalendarDayType.Workday,
        // ...dayLimits,
        start: request.start,
        end: request.end,

      };
    } else {
      newDay = {
        ...storedDay,
        ...request,
      };
    }

    return {
      ..._state,
      [day]: newDay,
    };
  }),

  on(calendarApiActions.deleteCalendarDayCompleted, (_state, { day }) => {
    const storedDay = _state[day];
    let newDay: Calendar.Day.Response;
    switch(storedDay.dayType) {
      case CalendarDayType.Vacation: {
        const dayLimits = calculateWorkdayLimits(WORKDAY_START, WORKDAY_END, storedDay.entries); // TODO
        newDay = {
          ...storedDay,
          dayType: CalendarDayType.Workday,
          // ...dayLimits,
          end: WORKDAY_END,
          start: WORKDAY_START,
        };
      } break;
      case CalendarDayType.Workday: {
        const dayLimits = calculateWorkdayLimits(WORKDAY_START, WORKDAY_END, storedDay.entries);
        newDay = {
          ...storedDay,
          ...dayLimits,
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

    return {
      ..._state,
      [day]: newDay,
    };
  }),

  on(calendarApiActions.createCalendarEntryCompleted, (_state, { type, calendarEntryId, customer, ...request }) => { 
    const currentDay = _state[request.day]; 
    let dayLimits: {start: number; end: number};
    
    if (request.entryType === CalendarEntryType.Work) {
      switch(currentDay.dayType) {
        case CalendarDayType.Weekend:
        case CalendarDayType.Workday: {
          dayLimits = {
            start: Math.max(request.end - WORKDAY_LENGTH, currentDay.start) || currentDay.start,
            end: Math.min(request.start + WORKDAY_LENGTH, currentDay.end) || currentDay.end,
          };
        } break;
      } 
    }
    return {
      ..._state,
      [request.day]: {
        ...currentDay,
        ...dayLimits,
        entries: currentDay.entries.concat(createCalendarEntryResponseFromRequest(calendarEntryId, request, customer))
          .toSorted((a, b) => a.start > b.start ? 1 : -1),
      },
    };
  }),

  on(calendarApiActions.updateCalendarEntryCompleted, (_state, { type, calendarEntryId, customer, ...request }) => {
    return Object.entries(_state).reduce<CalendarState>((accumulator, [
      date,
      dayResponse,
    ]) => {
      const index = dayResponse.entries.findIndex(e => e.calendarEntryId === calendarEntryId);

      let shouldRecalculate = false;
      let entries = dayResponse.entries;
      if (index >= 0) {
        entries = entries.toSpliced(index, 1);
        shouldRecalculate = request.entryType === CalendarEntryType.Work;
      }

      if (date === request.day) {
        entries = entries.concat(createCalendarEntryResponseFromRequest(calendarEntryId, request, customer)).toSorted((a, b) => a.start > b.start ? 1 : -1);
        shouldRecalculate = request.entryType === CalendarEntryType.Work;
      }

      let dayLimits: {start: number; end: number};
      if (shouldRecalculate) {
        switch (dayResponse.dayType) {
          case CalendarDayType.Weekend:
          case CalendarDayType.Workday: {
            // dayLimits = calculateWorkdayLimits(dayResponse.plannedStart, dayResponse.plannedEnd, entries); // TODO
          } break;
        }
      }

      return {
        ...accumulator,
        [date]: {
          ...dayResponse,
          // ...dayLimits,
          entries,
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

      const entries = response.entries.toSpliced(index, 1);

      let dayLimits: {start: number; end: number};
      switch (response.dayType) {
        case CalendarDayType.Weekend:
        case CalendarDayType.Workday: {
          // dayLimits = calculateWorkdayLimits(response.plannedStart, response.plannedEnd, entries); // TODO
        } break;
      }

      return {
        ...accumulator,
        [date]: {
          ...response,
          // ...dayLimits,
          entries,
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
