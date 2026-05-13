import { EventInstance } from '@ngrx/signals/events';
import { EMPTY, mergeMap, pipe } from 'rxjs';

export const dispatchIfConfirmed = (...events: EventInstance<string, any>[]) => {
  return pipe(
    mergeMap<boolean, typeof EMPTY | EventInstance<string, any>[]>((isConfirmed) => {
      if (isConfirmed) {
        return events.filter(x => !!x);
      }
      return EMPTY;
    }),
  );
};
