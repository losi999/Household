import { Price, Transaction } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { hairdressingActions, hairdressingApiActions } from '@household/web/state/hairdressing/hairdressing.actions';

export type HairdressingState = {
  priceList?: Price.Response[];
  income?: {
    [month: string]: Transaction.Report[];
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

  on(hairdressingApiActions.createPriceCompleted, hairdressingApiActions.updatePriceCompleted, (_state, { priceId, name, amount }) => {
  
    return {
      ..._state,
      priceList: _state.priceList.filter(p => p.priceId !== priceId)
        .concat({
          priceId,
          name,
          amount,
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
);
