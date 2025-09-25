import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { isListedPrice } from '@household/shared/common/type-guards';
import { CalendarEntryType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { JobPriceCalculatorValue } from '@household/web/app/shared/job-price-calculator/job-price-calculator.component';
import { hairdressingApiActions } from '@household/web/state/hairdressing/hairdressing.actions';
import { selectCalendarEntry } from '@household/web/state/calendar/calendar.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { calendarApiActions } from '@household/web/state/calendar/calendar.actions';

@Component({
  selector: 'household-hairdressing-calendar-entry-paying',
  standalone: false,  
  templateUrl: './hairdressing-calendar-entry-paying.component.html',
  styleUrl: './hairdressing-calendar-entry-paying.component.scss',
})
export class HairdressingCalendarEntryPayingComponent implements OnInit {
  entry: Observable<Calendar.Entry.Response>;
  prices: FormControl<JobPriceCalculatorValue[]>;

  constructor(private store: Store, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    const calendarEntryId = this.activatedRoute.snapshot.paramMap.get('calendarEntryId') as Calendar.Entry.Id;
    
    this.store.dispatch(hairdressingApiActions.listPricesInitiated());
    this.store.dispatch(calendarApiActions.getCalendarEntryInitiated({
      calendarEntryId,
    }));

    this.entry = this.store.select(selectCalendarEntry);
    this.prices = new FormControl<JobPriceCalculatorValue[]>([]);

    this.entry.subscribe((entry) => {
      if (entry?.entryType === CalendarEntryType.Work && entry?.prices?.length > 0) {
        this.prices.setValue(entry.prices.map((p) => {
          if (isListedPrice(p)) {
            const { quantity, ...price } = p;
            return {
              quantity,
              price,
            };
          }

          return p;
        }));
      }
    });
  }

}
