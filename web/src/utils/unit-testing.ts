import { MatDialogRef } from '@angular/material/dialog';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';

export const returnDialogAfterClosed = <R>(result?: R): MatDialogRef<any, R> => {
  return {
    afterClosed: () => of(result),
  } as MatDialogRef<any, R>;
};

export const expectEffectNotEmitted = (effect: Observable<any>, additional: () => void) => {
  let emitted = false;

  effect.subscribe({
    next: () => (emitted = true),
    complete: () => {
      expect(emitted).toBeFalse();
      additional();
    },
  });
};

export const expectEffectMultipleEmission = (effect: Observable<any>, actions: Action[], additional: () => void) => {
  const emitted: any[] = [];

  effect.subscribe({
    next: (action) => {
      emitted.push(action);
    },
    complete: () => {
      expect(emitted).toEqual(actions);
      additional();
    },
  });
};
