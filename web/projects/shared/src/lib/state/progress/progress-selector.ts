import { createFeatureSelector } from '@ngrx/store';

export const selectIsInProgress = createFeatureSelector<number>('progress');
  
