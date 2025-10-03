import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { isListedPrice } from '@household/shared/common/type-guards';
import { CalendarEntryType } from '@household/shared/enums';
import { Calendar } from '@household/shared/types/types';
import { JobPriceCalculatorValue } from '@household/web/app/shared/job-price-calculator/job-price-calculator.component';
import { priceApiActions } from '@household/web/state/price/price.actions';
import { selectCalendarEntry } from '@household/web/state/calendar/calendar.selector';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { calendarApiActions } from '@household/web/state/calendar/calendar.actions';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';

@Component({
  selector: 'household-calendar-entry-paying',
  standalone: false,  
  templateUrl: './calendar-entry-paying.component.html',
  styleUrl: './calendar-entry-paying.component.scss',
})
export class CalendarEntryPayingComponent implements OnInit {
  entry: Observable<Calendar.Entry.Response>;
  prices: FormControl<JobPriceCalculatorValue[]>;

  calendarEntryId: Calendar.Entry.Id;

  constructor(private store: Store, private activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.calendarEntryId = this.activatedRoute.snapshot.paramMap.get('calendarEntryId') as Calendar.Entry.Id;
    
    this.store.dispatch(priceApiActions.listPricesInitiated());
    this.store.dispatch(calendarApiActions.getCalendarEntryInitiated({
      calendarEntryId: this.calendarEntryId,
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

  onCashPayment() {
    this.store.dispatch(dialogActions.openCashPayment({
      calendarEntryId: this.calendarEntryId,
    }));
  }

  onBankPayment() {

  }

}
