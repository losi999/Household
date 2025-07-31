import { Action } from '@ngrx/store';
import { EMPTY, mergeMap, pipe } from 'rxjs';

export const dispatchIfConfirmed = (...actions: Action[]) => {
  return pipe(
    mergeMap<boolean, typeof EMPTY | Action[]>((isConfirmed) => {
      if (isConfirmed) {
        return actions;
      }
      return EMPTY;
    }),
  );
};
