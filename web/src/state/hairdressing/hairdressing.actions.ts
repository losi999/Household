import { Transaction } from '@household/shared/types/types';
import { createActionGroup, props } from '@ngrx/store';

export const hairdressingActions = createActionGroup({
  source: 'Hairdressing',
  events: {
    'List income initiated': props<{date: Date}>(),
    'List income completed': props<{transactions: Transaction.Report[], month: string}>(),
  },
});
