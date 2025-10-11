import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TrackByService {
  trackByIndex(index: number): number {
    return index;
  }
}
