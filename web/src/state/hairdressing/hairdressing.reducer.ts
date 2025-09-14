import { Calendar, Price, Transaction } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { hairdressingActions, hairdressingApiActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { isListedPrice, isPriceBase } from '@household/shared/common/type-guards';

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

  on(hairdressingApiActions.createCalendarEntryCompleted, (_state, { type, calendarEntryId, customer, ...request }) => {
    if (!_state.calendarDays?.[request.day]) {
      return _state;
    }

    let entry: Calendar.Entry.Response;

    if (request.entryType === CalendarEntryType.Work) {
      console.log(request);
      entry = {
        calendarEntryId,
        end: request.end,
        start: request.start,
        title: request.title,
        description: request.description,
        entryType: request.entryType,
        prices: request.prices.map((p) => {
          if (isPriceBase(p)) {
            return {
              name: p.name,
              amount: p.amount,
            };
          }
          
          return {
            ..._state.priceList.find(x => x.priceId === p.priceId),
            quantity: p.quantity,
          };
        }),
        customer,
      };
    } else {
      entry = {
        ...request,
        calendarEntryId,
      };
    }

    return {
      ..._state,
      calendarDays: {
        ..._state.calendarDays,
        [request.day]: {
          ..._state.calendarDays[request.day],
          entries: _state.calendarDays[request.day].entries.concat(entry)
            .toSorted((a, b) => a.start > b.start ? 1 : -1),
        },
      },
    };
  }),

  on(hairdressingApiActions.updateCalendarEntryCompleted, (_state, { type, calendarEntryId, ...request }) => { // TODO recalculate day start/end
    return {
      ..._state,
      calendarDays: Object.entries(_state.calendarDays).reduce<HairdressingState['calendarDays']>((accumulator, [
        date,
        dayResponse,
      ]) => {
        let entries = dayResponse.entries.filter(e => e.calendarEntryId !== calendarEntryId);

        if (date === request.day) {
          let entry: Calendar.Entry.Response;

          if (request.entryType === CalendarEntryType.Work) {
            entry = {
              calendarEntryId,
              end: request.end,
              start: request.start,
              title: request.title,
              description: request.description,
              entryType: request.entryType,
              prices: undefined, //TODO
              customer: undefined, //TODO
            };
          } else {
            entry = {
              ...request,
              calendarEntryId,
            };
          }

          entries = entries.concat(entry).toSorted((a, b) => a.start > b.start ? 1 : -1);
        }

        return {
          ...accumulator,
          [date]: {
            ...dayResponse,
            entries,
          },
        };
      }, {}),
    };
  }),

  on(hairdressingApiActions.deleteCalendarEntryCompleted, (_state, { calendarEntryId }) => { // TODO recalculate day start/end
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
