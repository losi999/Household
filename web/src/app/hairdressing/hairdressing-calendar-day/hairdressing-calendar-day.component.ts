import { Component, Input } from '@angular/core';
import { Calendar } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-hairdressing-calendar-day',
  standalone: false,  
  templateUrl: './hairdressing-calendar-day.component.html',
  styleUrl: './hairdressing-calendar-day.component.scss',
})
export class HairdressingCalendarDayComponent {
  @Input() day: Calendar.Day.Response;
  @Input() column: number;
  
  constructor(private store: Store) { }

  onEntryClick(entry: Calendar.Entry.Response) {
    this.store.dispatch(dialogActions.updateCalendarEntry({
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
