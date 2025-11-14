import { Type, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialogRef } from '@angular/material/dialog';
import { Action } from '@ngrx/store';
import { Observable, of } from 'rxjs';

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

export const createStubComponent = (
  selector: string,
  inputKeys: string[] = [],
  outputKeys: string[] = [],
): Type<any> => {

  @Component({
    selector,
    template: '',
  })
  class StubComponent {
    constructor() {
      outputKeys.forEach((key) => {
        this[key] = new EventEmitter();
      });
    }
  }

  inputKeys.forEach((key) => {
    Input()(StubComponent.prototype, key);
  });

  outputKeys.forEach((key) => {
    Output()(StubComponent.prototype, key);
  });

  return StubComponent;
};
