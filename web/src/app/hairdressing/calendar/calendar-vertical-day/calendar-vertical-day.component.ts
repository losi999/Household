import { Component, Input } from '@angular/core';
import { Calendar } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-calendar-vertical-day',
  standalone: false,
  
  templateUrl: './calendar-vertical-day.component.html',
  styleUrl: './calendar-vertical-day.component.scss',
})
export class CalendarVerticalDayComponent {
  @Input() day: Calendar.Day.Response;
  @Input() column: number;
  
  constructor(private store: Store) { }

  onEntryClick(entry: Calendar.Entry.Response) {
    this.store.dispatch(dialogActions.openCalendarEntry({
      ...entry,
      day: this.day.day,
    }));    
  }

  // onGridClick(event: PointerEvent) {
  //   if (event.target !== event.currentTarget) {
  //     return;
  //   }
  //   const gridElement = event.currentTarget as HTMLElement;
  //   const rect = gridElement.getBoundingClientRect();

  //   const y = event.clientY - rect.top;

  //   const row = Math.floor(y / 20) + 1;
  //   console.log(row);

  //   if (!this.day.entries.some(e => e.start < row && e.end >= row)) {
  //     alert(`Kiválasztott időpont: ${addMinutes((row - 1) * 15, this.day.date)}`);
  //   }

  // }
}
