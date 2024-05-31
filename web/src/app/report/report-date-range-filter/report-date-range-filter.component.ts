import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn } from '@angular/forms';

export type ReportDateRangeFilterValue = {
  include: boolean;
  from?: Date;
  to?: Date
};

const oneDateRequiredValidator: ValidatorFn = (control) => {
  return !control.value.from && !control.value.to ? {
    oneDateRequired: true,
  } : null;
};

const dateRangeValidator: ValidatorFn = (control) => {
  return control.value.from && control.value.to && control.value.from > control.value.to ? {
    invalidDateRange: true,
  } : null;
};

@Component({
  selector: 'household-report-date-range-filter',
  templateUrl: './report-date-range-filter.component.html',
  styleUrl: './report-date-range-filter.component.scss',
})
export class ReportDateRangeFilterComponent implements OnInit {
  @Output() rangeAdded = new EventEmitter<ReportDateRangeFilterValue>();

  form: FormGroup<{
    include: FormControl<boolean>;
    from: FormControl<Date>;
    to: FormControl<Date>;
  }>;

  ngOnInit(): void {
    this.form = new FormGroup({
      from: new FormControl(null),
      to: new FormControl(new Date()),
      include: new FormControl(true),
    }, [
      dateRangeValidator,
      oneDateRequiredValidator,
    ]);
  }

  addDate() {
    if (this.form.valid) {
      this.form.value.from?.setHours(0, 0, 0);
      this.form.value.to?.setHours(23, 59, 59);

      this.rangeAdded.emit({
        include: this.form.value.include,
        from: this.form.value.from ?? undefined,
        to: this.form.value.to ?? undefined,
      });
    }
  }
}
