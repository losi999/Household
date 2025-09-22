import { Calendar, Customer, Price, Transaction } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { hairdressingActions, hairdressingApiActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
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
      prices: customer?.jobs.find(j => j.name === request.title)?.prices,
      customer,
    };
  } 
  return {
    ...request,
    calendarEntryId,
  };
          
};

export type HairdressingState = {
  priceList?: Price.Response[];
  income?: {
    [month: string]: Transaction.Report[];
  };
  calendarDays?: {
    [date: string]: Calendar.Day.Response;
  }
};

export const hairdressingReducer = createReducer<HairdressingState>({},
  on(hairdressingActions.listIncomeCompleted, (_state, { transactions, month }) => {
    return {
      ..._state,
      income: {
        ..._state.income,
        [month]: transactions,
      },
    };
  }),

  on(hairdressingActions.saveIncomeCompleted, hairdressingActions.updateIncomeCompleted, (_state, { transactionId, amount, description, issuedAt }) => {
    const date = new Date(issuedAt);
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0') }`;

    return {
      ..._state,
      income: {
        ..._state.income,
        [month]: [
          ..._state.income[month].filter(t => t.transactionId !== transactionId),
          {
            transactionId,
            amount,
            issuedAt,
            description,
            billingEndDate: undefined,
            billingStartDate: undefined,
            invoiceNumber: undefined,
            account: undefined,
            category: undefined,
            product: undefined,
            project: undefined,
            recipient: undefined,
            quantity: undefined,
          },
        ],
      },
    };
  }),

  on(hairdressingActions.deleteIncomeCompleted, (_state, { transactionId }) => {
    return {
      ..._state,
      income: Object.entries(_state.income).reduce((accumulator, [
        month,
        transactions,
      ]) => {
        return {
          ...accumulator,
          [month]: transactions.filter(t => t.transactionId !== transactionId),
        };
      }, {}),
    };
  }),

  on(hairdressingApiActions.listPricesCompleted, (_state, { prices }) => {
    return {
      ..._state,
      priceList: prices,
    };
  }),

  on(hairdressingApiActions.createPriceCompleted, hairdressingApiActions.updatePriceCompleted, (_state, { priceId, name, amount, unitOfMeasurement }) => {
  
    return {
      ..._state,
      priceList: _state.priceList.filter(p => p.priceId !== priceId)
        .concat({
          priceId,
          name,
          amount,
          unitOfMeasurement,
        })
        .toSorted((a, b) => a.name.localeCompare(b.name, 'hu', {
          sensitivity: 'base',
        })),
    };
  }),
  
  on(hairdressingApiActions.deletePriceCompleted, (_state, { priceId }) => {
    return {
      ..._state,
      priceList: _state.priceList.filter(p => p.priceId !== priceId),
    };
  }),

  on(hairdressingApiActions.listCalendarDaysCompleted, (_state, { entries }) => {
    return {
      ..._state,
      calendarDays: {
        ..._state.calendarDays,        
        ...entries.reduce((accumulator, currentValue) => {
          return {
            ...accumulator,
            [currentValue.day]: currentValue,
          };
        }, {}),
      },
    };
  }),

  on(hairdressingApiActions.updateCalendarDayCompleted, (_state, { type, day, ...request }) => {
    const storedDay = _state.calendarDays[day];
    let newDay: Calendar.Day.Response;
    if (request.dayType === CalendarDayType.Workday) {
      const dayLimits = calculateWorkdayLimits(request.start, request.end, storedDay.entries);
      newDay = {
        ...storedDay,
        dayType: storedDay.dayType === CalendarDayType.Weekend ? CalendarDayType.Weekend : CalendarDayType.Workday,
        ...dayLimits,
        plannedStart: request.start,
        plannedEnd: request.end,

      };
    } else {
      newDay = {
        ...storedDay,
        ...request,
      };
    }

    return {
      ..._state,
      calendarDays: {
        ..._state.calendarDays,
        [day]: newDay,
      },
    };
  }),

  on(hairdressingApiActions.deleteCalendarDayCompleted, (_state, { day }) => {
    const storedDay = _state.calendarDays[day];
    let newDay: Calendar.Day.Response;
    switch(storedDay.dayType) {
      case CalendarDayType.Vacation: {
        const dayLimits = calculateWorkdayLimits(WORKDAY_START, WORKDAY_END, storedDay.entries);
        newDay = {
          ...storedDay,
          dayType: CalendarDayType.Workday,
          ...dayLimits,
          plannedEnd: WORKDAY_END,
          plannedStart: WORKDAY_START,
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
      calendarDays: {
        ..._state.calendarDays,
        [day]: newDay,
      },
    };
  }),

  on(hairdressingApiActions.createCalendarEntryCompleted, (_state, { type, calendarEntryId, customer, ...request }) => { 
    const currentDay = _state.calendarDays[request.day]; 
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
      calendarDays: {
        ..._state.calendarDays,
        [request.day]: {
          ...currentDay,
          ...dayLimits,
          entries: currentDay.entries.concat(createCalendarEntryResponseFromRequest(calendarEntryId, request, customer))
            .toSorted((a, b) => a.start > b.start ? 1 : -1),
        },
      },
    };
  }),

  on(hairdressingApiActions.updateCalendarEntryCompleted, (_state, { type, calendarEntryId, customer, ...request }) => {
    return {
      ..._state,
      calendarDays: Object.entries(_state.calendarDays).reduce<HairdressingState['calendarDays']>((accumulator, [
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
              dayLimits = calculateWorkdayLimits(dayResponse.plannedStart, dayResponse.plannedEnd, entries);
            } break;
          }
        }

        return {
          ...accumulator,
          [date]: {
            ...dayResponse,
            ...dayLimits,
            entries,
          },
        };
      }, {}),
    };
  }),

  on(hairdressingApiActions.deleteCalendarEntryCompleted, (_state, { calendarEntryId }) => {
    return {
      ..._state,
      calendarDays: Object.entries(_state.calendarDays).reduce<HairdressingState['calendarDays']>((accumulator, [
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
            dayLimits = calculateWorkdayLimits(response.plannedStart, response.plannedEnd, entries);
          } break;
        }

        return {
          ...accumulator,
          [date]: {
            ...response,
            ...dayLimits,
            entries,
          },
        };
      }, {}),
    };
  }),
);
