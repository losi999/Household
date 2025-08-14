import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CalendarEntryType } from '@household/shared/enums';

export type HairdressingCalendarEntryFormData = any;

@Component({
  selector: 'household-hairdressing-calendar-entry-form',
  standalone: false,    
  templateUrl: './hairdressing-calendar-entry-form.component.html',
  styleUrl: './hairdressing-calendar-entry-form.component.scss',
})
export class HairdressingCalendarEntryFormComponent implements OnInit {
  form: FormGroup<{
    title: FormControl<string>;
    description: FormControl<string>;
    day: FormControl<Date>;
    start: FormControl<Date>;
    end: FormControl<Date>;
    isAllDay: FormControl<boolean>;
    entryType: FormControl<CalendarEntryType>;
  }>;
  
  entryTypes: {
    [id in CalendarEntryType]: string
  } = {
      work: 'Munka',
      personal: 'Személyes',
      issue: 'Probléma',
    };

  ngOnInit(): void {
    this.form = new FormGroup({
      title: new FormControl(),
      description: new FormControl(),
      day: new FormControl(new Date()),
      start: new FormControl(new Date()),
      end: new FormControl(new Date()),
      isAllDay: new FormControl(false),
      entryType: new FormControl<CalendarEntryType>(CalendarEntryType.Work),
    });
  }

  onSubmit() {
    console.log(this.form);
  }
}
