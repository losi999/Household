import { Component, Input, OnInit } from '@angular/core';
import { WORKDAY_LENGTH } from '@household/shared/constants';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-hairdressing-calendar-day',
  standalone: false,  
  templateUrl: './hairdressing-calendar-day.component.html',
  styleUrl: './hairdressing-calendar-day.component.scss',
})
export class HairdressingCalendarDayComponent implements OnInit {
  @Input() day: Calendar.Day.Response;
  start: number;
  end: number;
  
  constructor(private store: Store) { }
  
  ngOnInit(): void {
    if (this.day.dayType === CalendarDayType.Workday || this.day.dayType === CalendarDayType.Weekend) {
      const workEntries = this.day.entries.filter(e => e.entryType === CalendarEntryType.Work);
      
      const { start, end } = workEntries.reduce<{start: number; end: number}>((accumulator, currentValue) => {
        const calculatedStart = currentValue.end - WORKDAY_LENGTH;
        const calculatedend = currentValue.start + WORKDAY_LENGTH;
        return {
          start: calculatedStart > accumulator.start ? calculatedStart : accumulator.start,
          end: calculatedend < accumulator.end ? calculatedend : accumulator.end,
        };
      }, {
        start: this.day.start,
        end: this.day.end,
      });

      this.start = start;
      this.end = end;
    }
  }

  onEntryClick(entry: Calendar.Entry.Response) {
    switch(entry.entryType) {
      case CalendarEntryType.Issue:
      case CalendarEntryType.Personal: {
        this.store.dispatch(dialogActions.updateCalendarEntry({
          ...entry,
          day: this.day.day,
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
