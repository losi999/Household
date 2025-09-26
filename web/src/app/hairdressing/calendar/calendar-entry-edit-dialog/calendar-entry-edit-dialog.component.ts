import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isListedPrice } from '@household/shared/common/type-guards';
import { createDate, dateToISODateString, dateToTimeSlot } from '@household/shared/common/utils';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
import { Calendar, Customer } from '@household/shared/types/types';
import { dialogActions } from '@household/web/state/dialog/dialog.actions';
import { selectCalendarDay } from '@household/web/state/calendar/calendar.selector';
import { Store } from '@ngrx/store';
import { combineLatest, filter, map, Observable, startWith, switchMap, take } from 'rxjs';
import { calendarActions, calendarApiActions } from '@household/web/state/calendar/calendar.actions';

export type CalendarEntryEditDialogData = Partial<Calendar.Entry.Response>;

@Component({
  standalone: false,    
  templateUrl: './calendar-entry-edit-dialog.component.html',
  styleUrl: './calendar-entry-edit-dialog.component.scss',
})
export class CalendarEntryEditDialogComponent implements OnInit {
  form: FormGroup<{
    job: FormControl<{
      customer: Customer.Response;
      job: Customer.Job.Response;
    }>
    title: FormControl<string>;
    description: FormControl<string>;
    day: FormControl<Date>;
    timeRange: FormControl<{
      start: number;
      end: number;
    }>;
  }>;

  errors: Observable<string[]>;

  constructor(private dialogRef: MatDialogRef<CalendarEntryEditDialogComponent, void>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public entry: CalendarEntryEditDialogData) { }

  private setFormFromJob(data: {
    customer: Customer.Response;
    job: Customer.Job.Response;
  }): typeof this.form.value {
    if (!data.job) {
      return {
        title: `${data.customer.name}: `,
      };
    }

    return {
      title: data.customer.isGroup ? data.job.name : `${data.customer.name}: ${data.job.name}`,
      description: data.job?.description,
      timeRange: {
        start: this.form.value.timeRange.start,
        end: this.form.value.timeRange.start + data.job.duration,
      },
    };
  }

  ngOnInit(): void {
    const now = new Date();
    now.setMinutes(Math.floor(now.getMinutes() / 15) * 15);
    this.form = new FormGroup({
      job: new FormControl(this.entry.entryType === CalendarEntryType.Work && this.entry.customer ? {
        customer: this.entry.customer,
        job: this.entry.customer?.jobs?.find(j => this.entry.title.endsWith(j.name)),
      } : null),
      title: new FormControl(this.entry.title, [Validators.required]),
      description: new FormControl(this.entry.description),
      day: new FormControl(createDate(this.entry.day) ?? now, [Validators.required]),
      timeRange: new FormControl({
        start: this.entry.start ?? dateToTimeSlot(now),
        end: this.entry.end ?? dateToTimeSlot(now) + 4,
      }), 
    });

    this.form.controls.job.valueChanges.pipe(filter(x => !!x)).subscribe((value) => {
      this.form.patchValue(this.setFormFromJob(value));
    });

    this.errors = combineLatest([
      this.form.controls.day.valueChanges.pipe(startWith(this.form.value.day),
        switchMap((date) => {
          const obs = this.store.select(selectCalendarDay(dateToISODateString(date)));

          obs.pipe(take(1)).subscribe((value) => {
            if (!value) {
              this.store.dispatch(calendarActions.listCalendarMonth({
                date, 
              }));
            }
          });

          return obs;
        })),
      this.form.controls.timeRange.valueChanges.pipe(startWith(this.form.value.timeRange)),
    ]).pipe(
      map(([
        day,
        timeRange,
      ]) => {
        if (!day) {
          return [];
        }
        const errors = [];

        if (this.entry.entryType === CalendarEntryType.Work) {

          switch(day.dayType) {
            case CalendarDayType.Vacation: {
              errors.push('Ezt a napot szabadságnak jelölted');
            } break;
            case CalendarDayType.Holiday: {
              errors.push('Munkaszüneti nap');
            } break;
            case CalendarDayType.Weekend: {
              errors.push('Hétvége');
            } break;
            case CalendarDayType.Workday: {
              if (timeRange.start < day.start || timeRange.end > day.end) {
                errors.push('Túlóra');
              }
            } break;
          }

        }

        day.entries.filter(e => !(timeRange.start >= e.end || timeRange.end <= e.start) && e.calendarEntryId !== this.entry.calendarEntryId).forEach((e) => {
          let entryTypeText: string;
          switch(e.entryType) {
            case CalendarEntryType.Work: {
              entryTypeText = 'munkával';
            } break;
            case CalendarEntryType.Issue: {
              entryTypeText = 'problémával';
            } break;
            case CalendarEntryType.Personal: {
              entryTypeText = 'személyes programmal';
            } break;
          }
          errors.push(`Ütközik az alábbi ${entryTypeText}: ${e.title}`);
        });
        return errors;
      }));
  }

  onSubmit() {
    if (this.form.valid) {
      let request: Calendar.Entry.Request;

      if (this.entry.entryType === CalendarEntryType.Work) {
        request = {
          entryType: CalendarEntryType.Work,
          day: dateToISODateString(this.form.value.day),
          start: this.form.value.timeRange.start,
          end: this.form.value.timeRange.end,
          title: this.form.value.title,
          description: this.form.value.description ?? undefined,
          customerId: this.form.value.job.customer.customerId,
          prices: this.form.value.job.job?.prices.map((p) => {
            if (isListedPrice(p)) {
              return {
                priceId: p.priceId,
                quantity: p.quantity,
              };
            }

            return {
              name: p.name,
              amount: p.amount,
            };
          }),
        };
      } else {
        request = {
          entryType: this.entry.entryType,
          day: dateToISODateString(this.form.value.day),
          start: this.form.value.timeRange.start,
          end: this.form.value.timeRange.end,
          title: this.form.value.title,
          description: this.form.value.description ?? undefined,
        };
      }

      if (this.entry.calendarEntryId) {
        this.store.dispatch(calendarApiActions.updateCalendarEntryInitiated({
          calendarEntryId: this.entry.calendarEntryId,
          ...request,
        }));
      } else {
        this.store.dispatch(calendarApiActions.createCalendarEntryInitiated(request));
      }

      this.dialogRef.close();
    }
  }

  onDelete() {
    this.store.dispatch(dialogActions.deleteCalendarEntry({
      calendarEntryId: this.entry.calendarEntryId,
      title: this.entry.title,
    }));
  }
}
