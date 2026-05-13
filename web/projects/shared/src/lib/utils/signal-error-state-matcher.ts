import { ModelSignal, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class SignalErrorStateMatcher implements ErrorStateMatcher {
  constructor(private touched: ModelSignal<boolean>) { }

  showError = signal(false);

  isErrorState(control: AbstractControl): boolean {
    return (this.touched() || control.touched) && this.showError();
  }
}
