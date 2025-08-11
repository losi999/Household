import { Component, Input, OnInit } from '@angular/core';
import { addMinutes } from '@household/shared/common/utils';
import { Day } from '@household/web/app/hairdressing/hairdressing-calendar-home/hairdressing-calendar-home.component';

@Component({
  selector: 'household-hairdressing-calendar-day',
  standalone: false,  
  templateUrl: './hairdressing-calendar-day.component.html',
  styleUrl: './hairdressing-calendar-day.component.scss',
})
export class HairdressingCalendarDayComponent implements OnInit {
  @Input() day: Day;
  
  ngOnInit(): void {
    console.log(this.day);
  }

  onGridClick(event: PointerEvent) {
    const gridElement = event.currentTarget as HTMLElement;
    const rect = gridElement.getBoundingClientRect();

    const y = event.clientY - rect.top;

    const row = Math.floor(y / 20) + 1;
    console.log(row);

    if (![
      ...this.day.workEntries,
      ...this.day.personalEntries,
    ].some(e => e.start < row && e.end >= row)) {
      alert(`Kiválasztott időpont: ${addMinutes((row - 1) * 15, this.day.date)}`);
    }

  }
}
