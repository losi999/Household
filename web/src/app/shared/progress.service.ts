import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  private progressCounter: number;
  constructor() {
    this.progressCounter = 0;
  }

  get isInProgress(): boolean {
    return this.progressCounter > 0;
  }

  processStarted() {
    this.progressCounter += 1;
  }

  processFinished() {
    this.progressCounter -= 1;
  }
}
