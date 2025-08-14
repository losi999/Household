import { Component, Input, OnInit } from '@angular/core';
import { addMinutes } from '@household/shared/common/utils';
import { CalendarEntryType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { selectCalendarDay } from '@household/web/state/hairdressing/hairdressing.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
  selector: 'household-hairdressing-calendar-day',
  standalone: false,  
  templateUrl: './hairdressing-calendar-day.component.html',
  styleUrl: './hairdressing-calendar-day.component.scss',
})
export class HairdressingCalendarDayComponent implements OnInit {
  @Input() day: string;

  calendarDay: Observable<any>;
  
  constructor(private store: Store) { }

  ngOnInit(): void {
    this.calendarDay = this.store.select(selectCalendarDay(this.day));
  }
  onEntryClick(entry: Calendar.Entry.Response) {
    switch(entry.entryType) {
      case CalendarEntryType.Issue:
      case CalendarEntryType.Personal: {
        this.store.dispatch(dialogActions.updateCalendarEntry({
          ...entry,
          day: this.day,
        }));    
      } break;
    }
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
