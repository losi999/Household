import { Calendar, Price, Transaction } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { hairdressingActions, hairdressingApiActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { CalendarDayType } from '@household/shared/enums';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';

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
      newDay = {
        ...storedDay,
        dayType: storedDay.dayType === CalendarDayType.Weekend ? CalendarDayType.Weekend : CalendarDayType.Workday,
        start: request.start,
        end: request.end,  
        plannedStart: undefined,
        plannedEnd: undefined,

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
        newDay = {
          ...storedDay,
          dayType: CalendarDayType.Workday,
          start: WORKDAY_START,
          end: WORKDAY_END,
          plannedEnd: WORKDAY_END,
          plannedStart: WORKDAY_START,
        };
      } break;
      case CalendarDayType.Workday: {
        newDay = {
          ...storedDay,
          start: WORKDAY_START,
          end: WORKDAY_END,
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

  on(hairdressingApiActions.createCalendarEntryCompleted, (_state, { calendarEntryId, day, description, end, entryType, start, title }) => {
    return {
      ..._state,
      calendarDays: {
        ..._state.calendarDays,
        [day]: {
          ..._state.calendarDays[day],
          entries: _state.calendarDays[day].entries.concat({
            entryType,
            title,
            start,
            end,
            description,
            calendarEntryId,
          })
            .toSorted((a, b) => a.start > b.start ? 1 : -1),
        },
      },
    };
  }),

  on(hairdressingApiActions.updateCalendarEntryCompleted, (_state, { calendarEntryId, day, description, end, entryType, start, title }) => {
    return {
      ..._state,
      calendarDays: Object.entries(_state.calendarDays).reduce<HairdressingState['calendarDays']>((accumulator, [
        date,
        response,
      ]) => {
        let entries = response.entries.filter(e => e.calendarEntryId !== calendarEntryId);

        if (date === day) {
          entries = entries.concat({
            entryType,
            title,
            start,
            end,
            description,
            calendarEntryId,
          }).toSorted((a, b) => a.start > b.start ? 1 : -1);
        }

        return {
          ...accumulator,
          [date]: {
            ...response,
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
        return {
          ...accumulator,
          [date]: {
            ...response,
            entries: response.entries.filter(e => e.calendarEntryId !== calendarEntryId),
          },
        };
      }, {}),
    };
  }),
);
