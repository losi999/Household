import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { isListedPrice } from '@household/shared/common/type-guards';
import { createDate, createWorkEntryTitle, dateToISODateString, dateToTimeSlot } from '@household/shared/common/utils';
import { CalendarDayType, CalendarEntryType } from '@household/shared/enums';
import { Calendar, Customer } from '@household/shared/types/types';
import { selectCalendarDay } from '@household/web/app/hairdressing/calendar/state/calendar.selector';
import { Store } from '@ngrx/store';
import { combineLatest, filter, map, Observable, startWith, switchMap, take } from 'rxjs';
import { calendarActions } from '@household/web/app/hairdressing/calendar/state/calendar.actions';

export type CalendarEntryEditDialogData = Partial<Calendar.Entry.Response>;
export type CalendarEntryEditDialogResult = Calendar.Entry.Request;

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
    start: FormControl<number>;
    duration: FormControl<number>;
  }>;

  errors: Observable<string[]>;
  title: string;

  constructor(private dialogRef: MatDialogRef<CalendarEntryEditDialogComponent, CalendarEntryEditDialogResult>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public entry: CalendarEntryEditDialogData) { }

  ngOnInit(): void {
    switch(this.entry.entryType) {
      case CalendarEntryType.Issue: {
        this.title = 'Probléma';
      } break;
      case CalendarEntryType.Work: {
        this.title = 'Munka';
      } break;
      case CalendarEntryType.Personal: {
        this.title = 'Személyes program';
      } break;
    }
    if (this.entry.calendarEntryId) {
      this.title += ' szerkesztése';
    } else {
      this.title += ' rögzítése';
    }

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
      start: new FormControl(this.entry.start ?? dateToTimeSlot(now)),
      duration: new FormControl(this.entry.end - this.entry.start || 4),
    });

    this.form.controls.job.valueChanges.pipe(filter(x => !!x)).subscribe(({ customer, job }) => {
      this.form.patchValue({
        title: createWorkEntryTitle(customer, job),
        description: job?.description,
        duration: job?.duration ?? 4,
      });
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
      this.form.controls.start.valueChanges.pipe(startWith(this.form.value.start)),
      this.form.controls.duration.valueChanges.pipe(startWith(this.form.value.duration)),
    ]).pipe(
      map(([
        day,
        start,
        duration,
      ]) => {
        if (!day) {
          return [];
        }
        const errors = [];

        const end = start + duration;

        if (this.entry.entryType === CalendarEntryType.Work) {
          switch (day.dayType) {
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
              if (start < day.start || end > day.end) {
                errors.push('Túlóra');
              }
            } break;
          }

        }

        day.entries.filter(e => !(start >= e.end || end <= e.start) && e.calendarEntryId !== this.entry.calendarEntryId).forEach((e) => {
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
      if (this.entry.entryType === CalendarEntryType.Work) {
        this.dialogRef.close({
          entryType: CalendarEntryType.Work,
          day: dateToISODateString(this.form.value.day),
          start: this.form.value.start,
          end: this.form.value.start + this.form.value.duration,
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
        });
      } else {
        this.dialogRef.close({
          entryType: this.entry.entryType,
          day: dateToISODateString(this.form.value.day),
          start: this.form.value.start,
          end: this.form.value.start + this.form.value.duration,
          title: this.form.value.title,
          description: this.form.value.description ?? undefined,
        });
      }
    }
  }
}
