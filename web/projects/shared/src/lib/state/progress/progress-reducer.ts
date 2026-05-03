import { progressActions } from './progress-actions';
import { createReducer, on } from '@ngrx/store';

export const progressReducer = createReducer<number>(0,
  on(progressActions.processStarted, (state) => state + 1),
  on(progressActions.processFinished, (state) => Math.max(state - 1, 0)),
);
  
