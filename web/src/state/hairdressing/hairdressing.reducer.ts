import { Transaction } from '@household/shared/types/types';
import { createReducer, on } from '@ngrx/store';
import { hairdressingActions } from '@household/web/state/hairdressing/hairdressing.actions';

export type HairdressingState = {
  income?: {[month: string]: Transaction.Report[]; }
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
);
