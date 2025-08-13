import { Component, OnInit } from '@angular/core';
import { addDays } from '@household/shared/common/utils';
import { hairdressingApiActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'household-hairdressing-calendar-home',
  standalone: false,
  templateUrl: './hairdressing-calendar-home.component.html',
  styleUrl: './hairdressing-calendar-home.component.scss',
})
export class HairdressingCalendarHomeComponent implements OnInit {
  daysOfWeek: string[];

  constructor(private store: Store) {}

  private calculateDaysOfWeek (date: Date) {
    this.daysOfWeek = [];
    const day = date.getDay();
    const diffToMonday = (day === 0 ? -6 : 1 - day);

    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    monday.setUTCHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i += 1) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      this.daysOfWeek.push(d.toISOString().split('T')[0]);
    }

    this.store.dispatch(hairdressingApiActions.listCalendarEntriesInitiated({
      dateFrom: this.daysOfWeek[0],
      dateTo: this.daysOfWeek[6],
    }));
  }

  ngOnInit(): void {
    this.calculateDaysOfWeek(new Date());       
  }

  onChangeWeek(diff: number) {
    const date = addDays(diff * 7, new Date(this.daysOfWeek[0]));
    this.calculateDaysOfWeek(date);  
  }

  onShowToday() {
    this.calculateDaysOfWeek(new Date());
  }
}
