import { signalStore, withComputed, withState } from '@ngrx/signals';
import { withProgressReducer } from './with-progress-reducer';
import { computed } from '@angular/core';

export type ProgressState = {
  count: number;
};

export const ProgressStore = signalStore({
  providedIn: 'root',
},
withState<ProgressState>({
  count: 0,
}),
withComputed((store) => ({
  isInProgress: computed(() => {
    return store.count() > 0;
  }),
})),  
withProgressReducer(),
);
