import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialogRef } from '@angular/material/dialog';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import * as vitest from 'vitest';

export type Mock<T extends Record<keyof T, any>> = {
  [P in keyof T]: vitest.Mock<T[P]>;
};

export const createMockService = <T extends Record<keyof T, any>>(...functionsToMock: (keyof T)[]): Mock<T> => {

  return functionsToMock.reduce((accumulator, currentValue) => {
    return {
      ...accumulator,
      [currentValue]: vi.fn(),
    };
  }, {}) as Mock<T>;
};

type PartialParameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? Partial<P> : never;

export const validateFunctionCall = <T extends (...args: any) => any>(func: T, ...args: PartialParameters<T>): void => {
  if (args.length > 0) {
    expect(func).toHaveBeenCalledWith(...args);
  } else {
    expect(func).not.toHaveBeenCalled();
  }
};

export const returnDialogAfterClosed = <R>(result?: R): MatDialogRef<any, R> => {
  return {
    afterClosed: () => of(result),
  } as MatDialogRef<any, R>;
};

export const returnBottomSheetAfterDismissed = <R>(result?: R): MatBottomSheetRef<any, R> => {
  return {
    afterDismissed: () => of(result),
  } as MatBottomSheetRef<any, R>;
};

export const expectEffectNotEmitted = (effect: Observable<any>, additional?: () => void) => {
  let emitted = false;

  effect.subscribe({
    next: () => (emitted = true),
    complete: () => {
      expect(emitted).toBeFalsy();
      additional?.();
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
