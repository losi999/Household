import { Component, OnInit } from '@angular/core';
import { addDays, dateToISODateString, numberToGivenDigits } from '@household/shared/common/utils';
import { WORKDAY_END, WORKDAY_START } from '@household/shared/constants';
import { CalendarEntryType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { hairdressingApiActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { selectCaledarDays } from '@household/web/state/hairdressing/hairdressing.selector';
import { Store } from '@ngrx/store';
import { filter, Observable, take } from 'rxjs';

@Component({
  selector: 'household-hairdressing-calendar-home',
  standalone: false,
  templateUrl: './hairdressing-calendar-home.component.html',
  styleUrl: './hairdressing-calendar-home.component.scss',
})
export class HairdressingCalendarHomeComponent implements OnInit {
  daysOfWeek: Observable<Calendar.Day.Response[]>;
  private weekStart: Date;
  gridTemplateRows: string;
  timeRange: {
    hour: string;
    row: number;
  }[];

  constructor(private store: Store) {}

  private loadWeek(date: Date) {
    const weekday = date.getDay();
    const diffToMonday = (weekday === 0 ? 6 : weekday - 1);
    
    this.weekStart = addDays(-diffToMonday, date);
    const weekEnd = addDays(-diffToMonday + 6, date);

    this.daysOfWeek = this.store.select(selectCaledarDays({
      dateFrom: dateToISODateString(this.weekStart),
      dateTo: dateToISODateString(weekEnd),
    }));

    this.daysOfWeek.pipe(filter(x => x.length > 0), take(1)).subscribe((days) => {
      this.timeRange = [];

      const { earliestEntryStart, latestEntryEnd } = days.reduce<{
        earliestEntryStart: number;
        latestEntryEnd: number;
      }>((accumulator, currentValue) => {
        let min = accumulator.earliestEntryStart;
        let max = accumulator.latestEntryEnd;
        
        currentValue.entries.forEach((e) => {
          if (e.start < min) {
            min = e.start;
          }
          if (e.end > max) {
            max = e.end;
          }
        });

        return {
          earliestEntryStart: min,
          latestEntryEnd: max,
        };
      }, {
        earliestEntryStart: WORKDAY_START,
        latestEntryEnd: WORKDAY_END,
      });
      
      const rowsToHideStart = Math.floor((earliestEntryStart - 1) / 2) * 2;
      const rowsToHideEnd = 96 - Math.floor((latestEntryEnd) / 2) * 2;
      
      this.gridTemplateRows = `repeat(${rowsToHideStart}, auto) repeat(${96 - rowsToHideStart - rowsToHideEnd}, 20px) repeat(${rowsToHideEnd}, auto)`;
      
      for (let i = rowsToHideStart; i <= 96 - rowsToHideEnd; i += 2) {
        this.timeRange.push({
          hour: `${numberToGivenDigits(Math.floor(i / 4))}:${i % 4 === 0 ? '00' : '30'}`,
          row: i + 1,
        });
      }      
    });

    this.store.dispatch(hairdressingApiActions.listCalendarDaysInitiated({
      dateFrom: dateToISODateString(this.weekStart),
      dateTo: dateToISODateString(weekEnd),
    }));     
  }

  ngOnInit(): void {
    this.loadWeek(new Date());
  }

  onChangeWeek(diff: number) {
    const date = addDays(diff * 7, new Date(this.weekStart));
    this.loadWeek(date);
  }

  onShowToday() {
    this.loadWeek(new Date());
  }

  onCreateWork() {
    // this.store.dispatch(dialogActions.createCalendarEntry());
  }

  onSetVacationDay(day: string) {
    this.store.dispatch(dialogActions.setVacationDay({
      day,
    }));
  }

  onSetWorkDay(day: Exclude<Calendar.Day.Response, Calendar.Day.HolidayResponse>) {
    this.store.dispatch(dialogActions.setWorkDay(day));
  }

  onCreatePersonal() {
    this.store.dispatch(dialogActions.createCalendarEntry({
      entryType: CalendarEntryType.Personal,
    }));
  }

  onCreateIssue() {
    this.store.dispatch(dialogActions.createCalendarEntry({
      entryType: CalendarEntryType.Issue,
    }));
  }
}
